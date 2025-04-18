import { globalComponents, globalModules, globalProviders } from '../../../global-imports';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';


interface Card {
id: number;
x: number;
y: number;
width: number;
height: number;
color: string;
}

@Component({
selector: 'app-view',
standalone: true,
imports: [
    globalModules,
    globalComponents,
],
providers: [globalProviders],
templateUrl: './view.component.html',
styleUrl: './view.component.scss'
})
export class ViewComponent {
cards: Card[] = [];
nextCardId = 1;

// Variáveis para arrastar cards
isDragging = false;
currentCard: Card | null = null;
offsetX = 0;
offsetY = 0;

// Variáveis para desenho
drawingMode = false;
isDrawing = false;
drawingPaths: string[] = [];
currentPath: string = '';
startX = 0;
startY = 0;

// Adiciona um novo card ao canvas
addCard(): void {
    const newCard: Card = {
    id: this.nextCardId++,
    x: 50 + Math.random() * 200,
    y: 50 + Math.random() * 200,
    width: 200,
    height: 150,
    color: this.getRandomColor()
    };
    this.cards.push(newCard);
}

// Remove um card pelo ID
removeCard(id: number): void {
    this.cards = this.cards.filter(card => card.id !== id);
}

// Alterna o modo de desenho
toggleDrawingMode(): void {
    this.drawingMode = !this.drawingMode;
}

// Limpa todo o canvas
clearCanvas(): void {
    this.cards = [];
    this.drawingPaths = [];
}

// Inicia a interação (arrastar ou desenhar)
startInteraction(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    if (this.drawingMode && target.classList.contains('canvas')) {
    this.startDrawing(event);
    }
}

handleInteraction(event: MouseEvent): void {
    if (this.isDragging && this.currentCard) {
    this.handleDragging(event);
    } else if (this.isDrawing) {
    this.continueDrawing(event);
    }
}

endInteraction(event: MouseEvent): void {
    if (this.isDragging) {
    this.isDragging = false;
    this.currentCard = null;
    } else if (this.isDrawing) {
    this.finishDrawing();
    }
}

// Métodos para arrastar cards
startDragging(event: MouseEvent, card: Card): void {
    if (this.drawingMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    this.isDragging = true;
    this.currentCard = card;
    this.offsetX = event.clientX - card.x;
    this.offsetY = event.clientY - card.y;
}

handleDragging(event: MouseEvent): void {
    if (!this.currentCard) return;
    
    this.currentCard.x = event.clientX - this.offsetX;
    this.currentCard.y = event.clientY - this.offsetY;
}

// Métodos para desenhar
startDrawing(event: MouseEvent): void {
    this.isDrawing = true;
    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    
    this.startX = event.clientX - rect.left;
    this.startY = event.clientY - rect.top;
    
    this.currentPath = `M${this.startX},${this.startY}`;
}

continueDrawing(event: MouseEvent): void {
    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.currentPath += ` L${x},${y}`;
}

    finishDrawing(): void {
        this.isDrawing = false;
        if (this.currentPath.length > 0) {
        this.drawingPaths.push(this.currentPath);
        this.currentPath = '';
        }
    }

    // Utilitário para gerar cores aleatórias
    private getRandomColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}
