/* HTMLRagnarokSpriteElement by OutOfCuriosity */

;(function( window ) {
	
	"use strict";

	if(Uint8Array === undefined || ArrayBuffer === undefined 
		|| !("slice" in ArrayBuffer.prototype) 
		|| DataView === undefined) {
		console.warn("HTMLRagnarokSpriteElement can't be used with this browser.");
		return;
	}

/* Helper classes */
	
	var uint8ArrayToString = function() {
		var tmp = Array( this.length );
		for( var i = 0; i < this.length; i++ ) {
			if( this[i] === 0 ) break;
			tmp[i] = String.fromCharCode( this[i] );
		}
		return tmp.join('');
	}

	var getString = function( offset, length ) {
		return uint8ArrayToString.call( new Uint8Array( this.buffer, offset, length ) );
	}

	var requestAnimationFrame = (function() {
		return window.requestAnimationFrame
			|| window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame
			|| function( fn ) {
				setTimeout( fn, 16.666 )
			}
	})();

	function SprParser( buffer ) {
		this.frames = [];
		this.bitmaps = [];
		this.parseStructure( buffer );
		this.buffer = buffer;
	};

	SprParser.PALFrame = function( buffer, offset ) {
		
		var struct = new DataView( buffer, offset );
		
		this.width = struct.getUint16( 0, true );
		this.height = struct.getUint16( 2, true );
		this.byteLength = struct.getUint16( 4, true );
		this.byteOffset = offset + 6;
		this.textureAtlasPosition = [ 0, 0 ];
		
	};

	SprParser.RGBAFrame = function( buffer, offset ) {
		
		var struct = new DataView( buffer, offset );
		
		this.width = struct.getUint16( 0, true );
		this.height = struct.getUint16( 2, true );
		this.byteOffset = offset + 4;
		this.byteLength = this.width * this.height * 4;
		this.textureAtlasPosition = [ 0, 0 ];
		
	};

	SprParser.prototype = {};

	SprParser.prototype.parseHeader = function( buffer ) {
		
		if( buffer.byteLength < 6 ) {
			throw 'Not enough data to parse header';
		}
		
		var struct = new DataView( buffer );
		
		this.header = {
			magic: getString.call( struct, 0, 2 ),
			version: struct.getUint16( 2, true ),
			frameCount: struct.getUint16( 4, true ),
			rgbFrameCount: 0
		};
		
		if( this.header.magic.localeCompare('SP') !== 0 ) {
			throw 'Incorrect file header';
		}
		
		if( this.header.version >= 0x200 ) {
			if( struct.buffer.byteLength < 8 ) {
				throw 'Not enough data to parse header';
			}
			this.header.rgbFrameCount = struct.getUint16( 6, true );
		}
			
	};

	SprParser.prototype.parsePalette = function( buffer ) {
		// 256 color RGBA palette
		var offset = buffer.byteLength - 1024;
		this.palette = new Uint8Array( buffer, offset, 1024 );
	};

	SprParser.prototype.parseFrameHeaders = function( buffer ) {
		
		var offset = ( this.header.version >= 0x200 ) ? 8 : 6;
		var frame;
		
		for( var i = 0; i < this.header.frameCount; i++ ) {
			
			frame = new SprParser.PALFrame( buffer, offset );
			offset += 6 + frame.byteLength;
			this.frames.push( frame );
			
		}
		
		if( this.header.version >= 0x200 ) {
		
			for( var i = 0; i < this.header.rgbFrameCount; i++ ) {
				
				frame = new SprParser.RGBAFrame( buffer, offset );
				offset += 4 + frame.byteLength;
				this.bitmaps.push( frame );
				
			}
		}
		
	};

	SprParser.prototype.parseStructure = function( buffer ) {
			
		if( !buffer ) throw 'Nothing to parse!';
		
		var offset = 0;
		
		var time = (new Date()).getTime();
		
		try {
			
			this.parseHeader( buffer );
			
			if( this.header.frameCount > 0 )
				this.parsePalette( buffer );
			
			this.parseFrameHeaders( buffer );
		
		} catch( e ) {
			throw e;
		}
		
	};


	SprParser.prototype.getIndexedFrameDataRgba = function( id ) {
		
		var frame = this.frames[id];
		
		var indexedData = new Uint8Array( 
			this.buffer, 
			frame.byteOffset, 
			frame.byteLength
		);
		
		var data = new Uint8Array( frame.width * frame.height * 4 );
		
		for( var i = 0, p = 0; p < indexedData.byteLength 
			&& i < frame.width * frame.height; ) {
			
			var colorIndex = indexedData[p++];
			
			if( colorIndex == 0 && this.header.version >= 0x201 ) {
				
				// RLE compressed sequence of "background color".
				// "0x00 0x00" is read as "0x00 0x02"
				
				var colorIndex2 = indexedData[p++];
				var length = ( colorIndex2 == 0 ) ? 2 : colorIndex2;
				
				// Note: Not really needed if transparency is used; typed 
				// arrays are initialized with zero filled buffers...
				for( var j = 0; j < length; j++, i++ ) {
					
					//data[4*i+0] = this.palette[0];
					//data[4*i+1] = this.palette[1];
					//data[4*i+2] = this.palette[2];
					//data[4*i+3] = 0;
				}
				
			} else {
				
				data[4*i+0] = this.palette[4*colorIndex+0];
				data[4*i+1] = this.palette[4*colorIndex+1];
				data[4*i+2] = this.palette[4*colorIndex+2];
				data[4*i+3] = 255;
				i++;
			}
			
		}
		
		return data;
		
	};

	SprParser.prototype.atlasDefaultWidth = 512;
	SprParser.prototype.atlasDefaultHeight = 512;

	SprParser.prototype.getAtlasTextureRgba = function( _override ) {

		var start = Date.now();

		var frameData = [];
		
		var totalArea = 0;
		
		for( var i = 0; i < this.header.frameCount; i++ ) {
			
			totalArea += this.frames[i].width * this.frames[i].height;
			
			frameData.push({
				width: this.frames[i].width,
				height: this.frames[i].height,
				id: i,
				type: 'palette'
			});
		}
		
		for( var i = 0; i < this.header.rgbFrameCount; i++ ) {
			
			totalArea += this.bitmaps[i].width * this.bitmaps[i].height;
			
			frameData.push({
				width: this.bitmaps[i].width,
				height: this.bitmaps[i].height,
				id: i,
				type: 'rgba'
			});
		}
		
		frameData.sort(function( a, b ) {
			return b.height - a.height;
		});
		
		var width, height;
		var expectedArea = _override !== undefined ? _override : 1.5 * totalArea;
		
		if( false && this.atlasDefaultWidth * this.atlasDefaultHeight < expectedArea ) {	
			width = this.atlasDefaultWidth;
			height = this.atlasDefaultHeight;
		} else {
			width = Math.max(
				frameData[0].width * Math.floor( Math.sqrt( expectedArea ) / frameData[0].width ),
				128
			);
			height = Math.ceil( expectedArea / width );
		}
		
		var atlas = new Uint8Array( 4 * width * height );
		
		var lastX = 0;
		var lastY = 0;
		var maxY = 0;
		
		for( var i = 0; i < frameData.length; i++ ) {
			
			var frame = frameData[i];
			var data = this.getFrameDataRgba( frame.id, frame.type );
			
			if( ( lastX + frame.width ) > width ) {
				lastX = 0;
				lastY += maxY;
				maxY = 0;
			}
			
			if( ( lastY + frame.height ) > height ) {
				// Ooops
				return this.getAtlasTextureRgba( expectedArea * 2 );
			}
			
			var frameObject = ( frame.type == 'rgba' )
				? this.bitmaps[frame.id]
				: this.frames[frame.id];
			
			frameObject.textureAtlasPosition = [ lastX, lastY ];
			
			for( var y = 0; y < frame.height; y++ ) {
				
				for( var x = 0; x < frame.width; x++ ) {
					
					var p1 = 4 * ( y * frame.width + x );
					var p2 = 4 * ( ( lastY + y ) * width + lastX + x );
					
					if( frame.type == 'rgba' ) {
						atlas[p2+0] = data[p1+3];
						atlas[p2+1] = data[p1+2];
						atlas[p2+2] = data[p1+1];
						atlas[p2+3] = data[p1+0];
					} else {
						atlas[p2+0] = data[p1+0];
						atlas[p2+1] = data[p1+1];
						atlas[p2+2] = data[p1+2];
						atlas[p2+3] = data[p1+3];
					}
					
				}
			}
			
			lastX += frame.width;
			maxY = Math.max( frame.height, maxY );
			
		}
		
		var finalHeight = lastY + maxY;
		var finalArea = finalHeight * width;
		
		return {
			data: new Uint8Array( atlas.buffer.slice( 0, 4 * finalArea ), 0, 4 * finalArea ),
			width: width,
			height: finalHeight
		};

	};

	SprParser.prototype.getRgbaFrameDataRgba = function( id ) {
		
		var frame = this.bitmaps[id];
		
		// This data is actually ABGR
		return new Uint8Array( this.buffer, frame.byteOffset, frame.byteLength );
		
	};

	SprParser.prototype.getFrameDataRgba = function( id, type ) {
		return ( type == 'rgba' ) 
			? this.getRgbaFrameDataRgba( id )
			: this.getIndexedFrameDataRgba( id )
	}

	var ActParser = function( buffer ) {
		this.actions = [];
		this.events = [];
		this.delays = [];
		this.parseStructure( buffer );
	};

	ActParser.prototype = {};

	ActParser.prototype.parseStructure = function( buffer ) {
		
		var data = new DataView( buffer );
		var p = 0;
		
		this.header = {
			magic: getString.call( data, p, 2 ),
			version: -1,
			actionCount: 0
		}
		
		p += 2;
		
		if( this.header.magic != 'AC' ) {
			throw "ActParser: File format error; uknown identifier";
		}
		
		this.header.version = data.getUint16( p, true );
		this.header.actionCount = data.getUint16( p + 2, true );
		
		p += 4;
		
		// Skip uknown bytes "reserved"
		p = 16;
		
		var action;
			
		for( var i = 0; i < this.header.actionCount; i++ ) {
			
			var frameCount = data.getUint32( p, true );
					
			p += 4;
			
			action = [];
			
			var frame;
			var attachments;
			
			for( var j = 0; j < frameCount; j++ ) {
				
				// Skip uknown bytes "range_unknown"
				p += 32;
				
				var spriteCount = data.getUint32( p, true );
				
				p += 4;
				
				frame = [];
				
				var sprite;
				
				for( var k = 0; k < spriteCount; k++ ) {
					
					sprite = {
						x: data.getInt32( p, true ),
						y: data.getInt32( p + 4, true ),
						id: data.getInt32( p + 8, true ),
						flipped: ( data.getInt32( p + 12, true ) != 0 ),
						color: [ 255, 255, 255, 255 ],
						angle: 0,
						type: 'palette',
						scaleX: 1.0,
						scaleY: 1.0,
						width: 0,
						height: 0
					}
					
					p += 16;
					
					if( this.header.version >= 0x200 ) {
						
						sprite.color = new Uint8Array( buffer.slice( p, p + 4 ) );
						
						p += 4;
						
					}
					
					if( this.header.version >= 0x204 ) {
						
						sprite.scaleX = data.getFloat32( p, true );
						sprite.scaleY = data.getFloat32( p + 4, true );
						
						p += 8;
						
					} else if( this.header.version >= 0x200 ) {
						
						sprite.scaleX = data.getFloat32( p, true );
						sprite.scaleY = sprite.scaleX;
						
						p += 4;
						
					}
					
					if( this.header.version >= 0x200 ) {
						
						sprite.angle = data.getInt32( p, true );
						sprite.type = ( data.getInt32( p + 4, true ) == 0 )
							? 'palette'
							: 'rgba';
							
						p += 8;
						
					}
					
					if( this.header.version >= 0x205 ) {
						
						sprite.width = data.getInt32( p, true );
						sprite.height = data.getInt32( p + 4, true );
						
						p += 8;
						
					}
					
					frame.push( sprite );
					
				}
				
				var eventIndex = -1;
				
				if( this.header.version > 0x200 ) {
					
					eventIndex = data.getUint32( p, true );
					
					p += 4;
					
				}
				
				var attachments = [];
				
				if( this.header.version >= 0x203 ) {
					
					var attachmentPointerCount = data.getInt32( p, true );
					
					p += 4;
					
					for( var k = 0; k < attachmentPointerCount; k++ ) {
						
						// Skip reserved bytes "reserved"
						p += 4;
						
						attachments.push({
							x: data.getInt32( p, true ),
							y: data.getInt32( p + 4, true ),
							attribute: data.getUint32( p + 8, true )
						});
						
						p += 12;
						
					}
				}
				
				action.push({
					sprites: frame,
					eventIndex: eventIndex,
					attachmentPointers: attachments
				});
				
			}
			
			this.actions.push( action );
		}
		
		if( this.header.version >= 0x201 ) {
		
			var eventCount = data.getUint32( p, true );
			
			p += 4;
			
			for( var i = 0; i < eventCount; i++ ) {
				
				this.events.push(
					getString.call( p, p, 40 )
				);
				
				p += 40;
				
			}
		
		}
		
		for( var i = 0; i < this.header.actionCount; i++ ) {
		
			if( this.header.version >= 0x202 ) {
				
				this.delays.push( data.getFloat32( p, true ) );
				
				p += 4;
				
			} else {
			
				this.delays.push( 4.0 );
			
			}
		
		}
		
	};

/* HTMLRagnarokSpriteElement definition */

	var tagName = 'ragnarok-sprite';

	var document = window.document;

	var useCustomElement = "register" in document 
		&& "createShadowRoot" in HTMLElement.prototype 
		&& typeof document.register == "function";
	
	var HTMLRagnarokSpriteElement;
	
	var HTMLRagnarokSpriteElementPrototype = Object.create( HTMLElement.prototype );
	
	HTMLRagnarokSpriteElementPrototype.setupCanvas = function() {
		this.canvas = window.document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
	};
	
	HTMLRagnarokSpriteElementPrototype.getActorBoundingBox = function() {
		
		var actorObj = this.actor;
		var spriteObj = this.sprite;
		
		var bx0 = 0;
		var by0 = 0;
		var bx1 = 0;
		var by1 = 0;
		
		for(var action_idx = 0; action_idx < actorObj.actions.length; action_idx++) {
		
		var action = actorObj.actions[action_idx];
		
		for(var i = 0; i < action.length; i++) {
			
			// For each frame ..
			
			for(var j = 0; j < action[i].sprites.length; j++) {
				
				// For each sprite ..
				
				var sprite = action[i].sprites[j];
				
				if(sprite.id < 0)
					continue;
				
				var spriteFrameData = sprite.type == 'palette'
						? spriteObj.frames[sprite.id]
						: spriteObj.bitmaps[sprite.id];
				
				var spr_width = sprite.width || spriteFrameData.width;
				var spr_height = sprite.height || spriteFrameData.height;
				
				var bbox = [
					0, // 0 top-left x
					0, // 1 top-left y
					spr_width, // 2 bottom-right x
					spr_height, // 3 bottom-right y
					spr_width, // 4 top-right x
					0, // 5 top-right y
					0, // 6 bottom-left x
					spr_height // 7 bottom-left y
				];
				
				// translate center
				bbox[0] += -spr_width/2;
				bbox[1] += -spr_height/2;
				bbox[2] += -spr_width/2;
				bbox[3] += -spr_height/2;
				
				bbox[4] += -spr_width/2;
				bbox[5] += -spr_height/2;
				bbox[6] += -spr_width/2;
				bbox[7] += -spr_height/2;
				
				// rotate 
				var x0, y0, t = sprite.angle * Math.PI / 180;
				
				x0 = bbox[0];
				y0 = bbox[1];
				
				bbox[0] = x0 * Math.cos(t) - y0 * Math.sin(t);
				bbox[1] = x0 * Math.sin(t) + y0 * Math.cos(t);
				
				x0 = bbox[2];
				y0 = bbox[3];
				
				bbox[2] = x0 * Math.cos(t) - y0 * Math.sin(t);
				bbox[3] = x0 * Math.sin(t) + y0 * Math.cos(t);
				
				x0 = bbox[4];
				y0 = bbox[5];
				
				bbox[4] = x0 * Math.cos(t) - y0 * Math.sin(t);
				bbox[5] = x0 * Math.sin(t) + y0 * Math.cos(t);
				
				x0 = bbox[6];
				y0 = bbox[7];
				
				bbox[6] = x0 * Math.cos(t) - y0 * Math.sin(t);
				bbox[7] = x0 * Math.sin(t) + y0 * Math.cos(t);
				
				if(sprite.flipped) {
					bbox[0] *= -1;
					bbox[2] *= -1;
					bbox[4] *= -1;
					bbox[6] *= -1;
				}
				
				// scale
				bbox[0] *= sprite.scaleX;
				bbox[1] *= sprite.scaleY;
				bbox[2] *= sprite.scaleX;
				bbox[3] *= sprite.scaleY;
				
				bbox[4] *= sprite.scaleX;
				bbox[5] *= sprite.scaleY;
				bbox[6] *= sprite.scaleX;
				bbox[7] *= sprite.scaleY;
				
				// translate dx
				bbox[0] += sprite.x;
				bbox[1] += sprite.y;
				bbox[2] += sprite.x;
				bbox[3] += sprite.y;
				
				bbox[4] += sprite.x;
				bbox[5] += sprite.y;
				bbox[6] += sprite.x;
				bbox[7] += sprite.y;
				
				var sbx0 = Math.min(bbox[0], bbox[2], bbox[4], bbox[6]);
				var sby0 = Math.min(bbox[1], bbox[3], bbox[5], bbox[7]);
				var sbx1 = Math.max(bbox[0], bbox[2], bbox[4], bbox[6]);
				var sby1 = Math.max(bbox[1], bbox[3], bbox[5], bbox[7]);
			
				bx0 = Math.min(bx0, sbx0);
				by0 = Math.min(by0, sby0);
				bx1 = Math.max(bx1, sbx1);
				by1 = Math.max(by1, sby1);
			
			}
			
		}
		
		}
		
		return [bx0, by0, bx1, by1];
		
	};

	HTMLRagnarokSpriteElementPrototype.getRemoteFile = function( filename, callback, arg1 ) {
		var b_url = filename;
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open('GET', b_url, true);
		xmlhttp.responseType = 'arraybuffer';
		xmlhttp.onreadystatechange = function() {
			if( this.readyState == 4 ) {
				callback( this.response, arg1 );
			}
		}
		xmlhttp.send(null);
	};
	
	HTMLRagnarokSpriteElementPrototype.loadAsync = function( name, callback ) {
		
		this.getRemoteFile( name + '.spr', (function( buffer ) {
			
			try {
			
				this.sprite = new SprParser( buffer );
			
			} catch( e ) {
				
				throw "HTMLRagnarokSpriteElement Exception: Invalid SPR file for ";
				
			}
			
			this.getRemoteFile( name + '.act', (function( buffer ) { 
				
				try {
				
					this.actor = new ActParser( buffer );
				
				} catch( e ) {
				
					throw "HTMLRagnarokSpriteElement Exception: Invalid ACT file";
				
				}
				
				callback();
				
			}).bind( this ));
			
		}).bind( this ));
	};
	
	HTMLRagnarokSpriteElementPrototype.begin = function() {
		
		var htmlElement = this.tag || this;
		
		var uri = htmlElement.getAttribute('src').replace(/\.act$/, "");
		
		if( uri.length < 1 ) {
			throw "HTMLRagnarokSpriteElement Exception: No source URI defined";
		}
		
		this.loadAsync( uri, (function() {
			
			var domAttrWidth = Number( htmlElement.getAttribute('width')) || false;
			var domAttrHeight = Number( htmlElement.getAttribute('height')) || false;
			var domAttrScale = Number( htmlElement.getAttribute('scale')) || 1.0;
			var domAttrSpeed = Number( htmlElement.getAttribute('speed')) || 1.0;
			var domAttrIsAnimated = htmlElement.getAttribute('animated') == 'false' ? false : true;
			
			// Texture data
			
			var atlasData = this.sprite.getAtlasTextureRgba();
			var atlas = document.createElement('canvas');
			
			atlas.width = atlasData.width;
			atlas.height = atlasData.height;
			
			var imgd = atlas.getContext('2d').createImageData(atlas.width, atlas.height);
			
			for(var i = 0; i < imgd.data.length; i++) { imgd.data[i] = atlasData.data[i]; }
			
			atlas.getContext('2d').putImageData(imgd, 0, 0);
			
			var canvas = this.canvas;
			var ctx = this.ctx;
			
			var abbox;
			
			var sizeSetByDomAttr = function() {
				return typeof domAttrWidth == "number" && typeof domAttrHeight == "number";
			}
			
			if( sizeSetByDomAttr() ) {
				
				canvas.width = domAttrWidth;
				canvas.height = domAttrHeight;
				
			} else {
				
				abbox = this.getActorBoundingBox();
				
				canvas.width = Math.ceil( (abbox[2] - abbox[0]) * domAttrScale );
				canvas.height = Math.ceil( (abbox[3] - abbox[1]) * domAttrScale );
			}
			
			var currentAction = 0;
			var currentFrame = 0;
			var timeElapsed = 0;
			var lastUpdate = Date.now();
			var deathCurrentOpacity = 1.0;
			var deathLoopDelay = 3500;
			
			htmlElement.addEventListener("mousedown", (function() {
				currentAction = (currentAction + 2) % this.actor.actions.length;
				deathCurrentOpacity = 1.0;
				currentFrame = 0;
				timeElapsed = 0;
			}).bind( this ));
			
			/* _* */
			
			var needsUpdate = true;
			var animate;
			
			var isLastFrame = function( action ) { return currentFrame + 1 >= action.length };
			var isActDead = function() { return currentAction >= 32 && currentAction <= 38 };
			
			var nextFrameId = function( action ) { currentFrame = ( currentFrame + 1) % action.length; };
			var setFrameId = function( frameId ) { currentFrame = frameId; };
			
			var timePassed = function( time ) { timeElapsed -= time; };
			
			animate = (function() {
				
				var action = this.actor.actions[ currentAction ];
				var frame = action[ currentFrame ];
				var delay = 25 * this.actor.delays[ currentAction ] / domAttrSpeed;
								
				if( timeElapsed > delay ) { // Update frame
					
					if( isLastFrame( action ) && isActDead() ) {
						
						deathCurrentOpacity = Math.max(0, 1.0 - timeElapsed / deathLoopDelay );
						
						if( timeElapsed >= deathLoopDelay ) {
							
							deathCurrentOpacity = 1.0;
							
							setFrameId( 0 );
							timePassed( deathLoopDelay );
							
						}
						
					} else {
						
						timePassed( delay );
						nextFrameId( action );
						
					}
					
					needsUpdate = true;
					
				}
				
				if( needsUpdate ) {
					
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.save();
					
					// Translate drawing center of canvas
					if( sizeSetByDomAttr() ) { 
						ctx.translate( 0.5 * domAttrWidth, 0.9 * domAttrHeight );
						ctx.scale( domAttrScale, domAttrScale );
					} else {					
						ctx.scale( domAttrScale, domAttrScale );
						ctx.translate( -abbox[0], -abbox[1] );
					}
					
					for(var i = 0; i < frame.sprites.length; i++) {
					
						var sprite = frame.sprites[i];
						
						if(sprite.id < 0)
							continue;
						
						var spriteFrameData = sprite.type == 'palette'
							? this.sprite.frames[sprite.id]
							: this.sprite.bitmaps[sprite.id];
						
						ctx.save();
						
						var spr_width = spriteFrameData.width;
						var spr_height = spriteFrameData.height;
						
						ctx.translate( sprite.x, sprite.y );
						ctx.scale( sprite.scaleX, sprite.scaleY );
						ctx.rotate( sprite.angle * Math.PI / 180 );
						
						if(sprite.flipped) ctx.scale(-1, 1);
						
						ctx.translate( -0.5 * spr_width, -0.5 * spr_height );
						ctx.globalAlpha = deathCurrentOpacity * sprite.color[3] / 255;
						
						ctx.drawImage(
							atlas, 
							spriteFrameData.textureAtlasPosition[0], 
							spriteFrameData.textureAtlasPosition[1],
							spriteFrameData.width,
							spriteFrameData.height,
							0,
							0, 
							spriteFrameData.width,
							spriteFrameData.height
						);
						
						ctx.restore();
						
					};
					
					ctx.restore();
				
				}
				
				needsUpdate = false;
				
				var dt = Date.now() - lastUpdate;
				
				if(dt < 100) {
					timeElapsed += dt;
				}
				
				lastUpdate = Date.now();
				
				// Draw next frame
				if( domAttrIsAnimated )
					this.animationKey = requestAnimationFrame(animate);
		
			}).bind( this );
			
			animate();
			
			
		}).bind( this ));
		
		this.running = true;
		
	};
	
	HTMLRagnarokSpriteElementPrototype.stop = function() {
		this.running = false;
		cancelAnimationFrame( this.animationKey );
	};

	if( useCustomElement ) {
				
		HTMLRagnarokSpriteElementPrototype.createdCallback = function() { 
			/* DOM element constructor */
			this.setupCanvas();
			var shadowRoot = this.createShadowRoot();
			shadowRoot.appendChild( this.canvas );
		};
		
		HTMLRagnarokSpriteElementPrototype.enteredDocumentCallback = function() {
			
			this.inDOM = true;
			this.begin();
		};
		HTMLRagnarokSpriteElementPrototype.leftDocumentCallback = function() {
		
			this.inDOM = false;
			this.stop();
		
		}
		
		HTMLRagnarokSpriteElementPrototype.attributeChangedCallback = function(attrName, oldVal, newVal) {
			
			if( attrName == "src" && this.inDOM == true ) {
				
				if( this.running ) {
					this.stop();
				}
				
				this.begin();
				
			}
		};
		
		HTMLRagnarokSpriteElement = document.register(tagName, {
			prototype: HTMLRagnarokSpriteElementPrototype
		});
		
	} else {
		
		HTMLRagnarokSpriteElement = function( tag ) {
			
			this.setupCanvas();
			
			this.__pseudo = true;
			
			this.tag = tag;
			this.tag.appendChild( this.canvas );
			
		};
		
		HTMLRagnarokSpriteElement.prototype = HTMLRagnarokSpriteElementPrototype;
		
		//console.log("Not supported!");
		
	}
	
	var domAttributes = ["animated", "src", "speed", "scale", "width", "height"];
	
	for(var i = 0; i < domAttributes.length; i++) {
		
		var attr = domAttributes[ i ];
		
		HTMLRagnarokSpriteElementPrototype.__defineGetter__(attr, (function( domAttr ) {
			return function() {
				if( !("__pseudo" in this) ) {
					return this.getAttribute( domAttr );
				} else {
					return this.tag.getAttribute( domAttr );
				}
			}
		})( attr ));
		
		HTMLRagnarokSpriteElementPrototype.__defineSetter__(attr, (function( domAttr ) {
			return function( value ) {
				if( !("__pseudo" in this) ) {
					return this.setAttribute( domAttr, value );
				} else {
					return this.sag.getAttribute( domAttr, value );
				}
			}
		})( attr ));
		
	}
	
	window.HTMLRagnarokSpriteElement = HTMLRagnarokSpriteElement;
	
	window.addEventListener('load', function() {
	
		if(document.styleSheets[0] && document.styleSheets[0].insertRule)
			document.styleSheets[0].insertRule('ragnarok-sprite {\
				display: inline-block;\
				margin: 0;\
				padding: 0;\
				border: 0;\
				-webkit-user-select: none;\
				-moz-user-select: none;\
				-khtml-user-select: none;\
			}', 0);
		
		if( !useCustomElement ) {
		
			var spriteTags = document.getElementsByTagName( tagName );
			
			//console.log();
			
			for(var i = 0; i < spriteTags.length; i++) {
				
				var tag = spriteTags[i];
				
				var el = new HTMLRagnarokSpriteElement( tag );
				
				el.begin();
				
				//setTimeout( function() {
				
				//	setInterval(function() {
					
				//		for(var i = 0; i < tag.parentNpode) {
						
				//		}
					
				//		if( tag === undefined ) {
							// Element has been removed
							// Stop the animation
				//			console.log("Stopping");
				//			el.stop();
				//		}
						
				//	}, 1000 );
				
				//}, 100 * i );
				
			}
		
		}
		
	}, false);
	
})( window );



