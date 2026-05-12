/**
 * Minimal type declarations for `five-bells-condition` v5.
 * Upstream ships no .d.ts. Add to this file if we expand usage.
 */
declare module "five-bells-condition" {
  export class PreimageSha256 {
    setPreimage(preimage: Buffer): void;
    getConditionBinary(): Buffer;
    serializeBinary(): Buffer;
  }
  export function validateCondition(serializedCondition: string): boolean;
  export function validateFulfillment(
    serializedFulfillment: string,
    serializedCondition: string,
  ): boolean;
}
