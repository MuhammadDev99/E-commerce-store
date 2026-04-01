// lib/errors.ts
export class NotFoundError extends Error {
    constructor(entity: string, id: string | number) {
        super(`${entity} with id [${id}] not found`);
        this.name = "NotFoundError";
    }
}