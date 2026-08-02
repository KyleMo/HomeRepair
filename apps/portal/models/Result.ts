//import { z } from "zod";

export type Result<T, K = string> =
    | { success: true; value: T }
    | { success: false; error: K };

// export const zodResult = z
//     .object({
//         success: z.literal(true),
//         value: z.any(),
//     })
//     .or(
//         z.object({
//             success: z.literal(false),
//             error: z.any(),
//         }),
//     );
