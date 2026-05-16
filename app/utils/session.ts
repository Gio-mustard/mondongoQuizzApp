import { Database } from "./database";


interface Session {
	id: string;
	secretHash: Uint8Array; // Uint8Array is a byte array
	createdAt: Date;
    username:string;
    icon:string;

}

function generateSecureRandomString(): string {
	const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";

	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);

	let id = "";
	for (let i = 0; i < bytes.length; i++) {
		id += alphabet[bytes[i] >> 3];
	}
	return id;
}

export function create_session(db:Database){
    // TODO : hay que hacer este metodo hasta que tengamos la BD configurada para evitar refactorizacion (por eso tuviste que aprender a usar la API de mondongo antes de escribir el auth eh!)
    // https://lucia-auth.com/sessions/basic
}