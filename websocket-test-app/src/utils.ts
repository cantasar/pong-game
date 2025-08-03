export function getCurrentUserId(token: string): number {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || payload.userId || payload.sub;
    } catch (error) {
        console.error('Error decoding token:', error);
        return 0;
    }
}

export function getToken(): string {
    const tokenInput = document.getElementById('token') as HTMLInputElement;
    return tokenInput.value.trim();
}
