import { z } from 'zod'

/** Lines built by this tool. Tech has its own templates (tech.yaml is kept as source only). */
export const LINES = ['biznes', 'instalacje', 'software', 'prokom'] as const
export type LineId = (typeof LINES)[number]

/** Lines that may appear in `linie` of a shared template (tech is allowed but not built). */
const ALL_LINES = ['biznes', 'instalacje', 'software', 'prokom', 'tech'] as const

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/)

const lineDataSchema = z
  .object({
    NAZWA: z.string(),
    KROTKO: z.string(),
    WWW: z.string(),
    MAIL: z.string(),
    TEL: z.string(),
    TEL2: z.string(),
    GODZ: z.string(),
    OBIETNICA: z.string(),
    OPIS: z.string(),
    ACC: hex,
    ACC_TXT: hex,
    ACC_BTN: hex,
    ACC_SOFT: hex,
    LOGO: z.string(),
    PODPISUJE: z.string(),
    ROLA: z.string(),
  })
  .catchall(z.unknown())

export const daneSchema = z.object({
  wspolne: z.record(z.string(), z.string()),
  linie: z.object({
    biznes: lineDataSchema,
    instalacje: lineDataSchema,
    software: lineDataSchema,
    prokom: lineDataSchema,
    tech: lineDataSchema.optional(),
  }),
  pytania: z.record(z.string(), z.string()),
})
export type Dane = z.infer<typeof daneSchema>
export type LineData = z.infer<typeof lineDataSchema>

export const templateSchema = z.object({
  id: z.string().min(1),
  grupa: z.string().min(1),
  nazwa: z.string().min(1),
  skrot: z.string().regex(/^[a-z0-9]+$/, 'skrot: small letters and digits only'),
  linie: z.array(z.enum(ALL_LINES)).optional(),
  kiedy: z.string().min(1),
  temat: z.string().optional(),
  tresc: z.string().min(1),
})
export type Template = z.infer<typeof templateSchema>

export const autoReplySchema = z.object({
  id: z.string(),
  nazwa: z.string(),
  tresc: z.string(),
})
export type AutoReply = z.infer<typeof autoReplySchema>

export const templateFileSchema = z
  .object({
    grupy: z.record(z.string(), z.string()),
    szablony: z.array(templateSchema),
    autoodpowiedzi: z.array(autoReplySchema).optional(),
  })
  .superRefine((file, ctx) => {
    const seen = new Set<string>()
    for (const [i, t] of file.szablony.entries()) {
      if (seen.has(t.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['szablony', i, 'id'],
          message: `duplicate id: ${t.id}`,
        })
      }
      seen.add(t.id)
      if (!(t.grupa in file.grupy)) {
        ctx.addIssue({
          code: 'custom',
          path: ['szablony', i, 'grupa'],
          message: `unknown group: ${t.grupa}`,
        })
      }
    }
  })
export type TemplateFile = z.infer<typeof templateFileSchema>
