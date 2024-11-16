import {  
    PrivateKey,
    Poseidon,
    Field
} from 'o1js'

export function generateKeyPair() {
    return PrivateKey.randomKeypair()
}