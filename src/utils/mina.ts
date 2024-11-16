import {  
    PrivateKey,
    Poseidon,
    Field,
    Mina
} from 'o1js'

export function generateKeyPair() {
    return PrivateKey.randomKeypair()
}