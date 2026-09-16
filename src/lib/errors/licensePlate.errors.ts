export class PlateValidationError extends Error {
    constructor(message = 'Ingresa 3 letras y 3 o 4 números, como ABC-123 o ABC-1234.') {
        super(message);
        this.name = 'PlateValidationError';
    }
}
