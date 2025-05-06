export interface IToast {
    icon?: string | null;
    title: string;
    message: string;
    variant: 'success' | 'error';
    id?: number;
}