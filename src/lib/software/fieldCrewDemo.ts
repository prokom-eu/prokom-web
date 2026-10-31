import { plural } from '../plural'

/**
 * State of the clickable field crew demo (board `Rozwiazanie`, `/rozwiazania/aplikacja-dla-ekip-w-terenie`):
 * one job through four steps — on the way, on site, signature, done. Pure: the component keeps
 * the state, this moves it and says what the phone and the office board show. Data is fictitious
 * (the board says so); the step names and tasks come from `Solutions.page.demo`.
 */

export const TASK_COUNT = 4
export const MAX_PHOTOS = 4

export type DemoState = {
  /** 0 on the way · 1 on site · 2 signature · 3 done. */
  step: 0 | 1 | 2 | 3
  tasks: readonly boolean[]
  signed: boolean
  photos: number
  /** The visitor clicked: the demo stops moving on its own. */
  touched: boolean
}

export type DemoAction =
  | { type: 'pick'; step: number }
  | { type: 'toggleTask'; index: number }
  | { type: 'addPhoto' }
  | { type: 'sign' }
  /** The main button of the phone. */
  | { type: 'next' }
  | { type: 'restart' }
  /** The timer (every 7 s until touched). */
  | { type: 'auto' }

const none = (): boolean[] => Array.from({ length: TASK_COUNT }, () => false)
const all = (): boolean[] => Array.from({ length: TASK_COUNT }, () => true)
const half = (): boolean[] => Array.from({ length: TASK_COUNT }, (_, i) => i < TASK_COUNT / 2)

/** The board opens on site with half of the tasks done. */
export const INITIAL_DEMO: DemoState = {
  step: 1,
  tasks: half(),
  signed: false,
  photos: 2,
  touched: false,
}

const asStep = (value: number): DemoState['step'] => (((value % 4) + 4) % 4) as DemoState['step']

export const doneCount = (state: DemoState) => state.tasks.filter(Boolean).length

/** What a step looks like when the demo plays on its own. */
function autoState(step: DemoState['step']): DemoState {
  return {
    step,
    tasks: step >= 2 ? all() : step === 0 ? none() : half(),
    signed: step === 3,
    photos: step === 0 ? 1 : step === 1 ? 2 : 3,
    touched: false,
  }
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'auto':
      return state.touched ? state : autoState(asStep(state.step + 1))
    case 'pick':
      return { ...state, step: asStep(action.step), touched: true }
    case 'toggleTask': {
      if (action.index < 0 || action.index >= TASK_COUNT) return state
      const tasks = state.tasks.map((done, i) => (i === action.index ? !done : done))
      return { ...state, tasks, touched: true }
    }
    case 'addPhoto':
      return { ...state, photos: Math.min(MAX_PHOTOS, state.photos + 1), touched: true }
    case 'sign':
      return { ...state, signed: true, touched: true }
    case 'restart':
      return { step: 0, tasks: none(), signed: false, photos: 1, touched: true }
    case 'next': {
      // On site the button ticks the rest first, at the protocol it asks for the signature.
      if (state.step === 1 && doneCount(state) < TASK_COUNT) {
        return { ...state, tasks: all(), touched: true }
      }
      if (state.step === 2 && !state.signed) return { ...state, signed: true, touched: true }
      if (state.step === 3)
        return { step: 0, tasks: none(), signed: false, photos: 1, touched: true }
      return { ...state, step: asStep(state.step + 1), touched: true }
    }
  }
}

export type DemoTexts = {
  status: string
  button: string
  /** One line of the office log. */
  log: string
  /** Floating cards next to the board (desktop) and the office card (phone). */
  cardA: { title: string; text: string }
  cardB: { title: string; text: string }
  hint: string
  /** The protocol line on the phone („4/4 zadania · 3 zdjęcia · materiały zużyte”). */
  protocol: string
  /** Count of jobs per column: new, on the way, on site, done. */
  columns: [number, number, number, number]
}

/** Texts of the phone and the office board for a state (the board's copy). */
export function demoTexts(state: DemoState): DemoTexts {
  const done = doneCount(state)
  const { step, signed, photos } = state
  const photosLabel = `${photos} ${plural(photos, ['zdjęcie', 'zdjęcia', 'zdjęć'])}`
  return {
    status: ['W drodze', 'Na miejscu', 'Protokół', 'Zakończone'][step]!,
    button: [
      'Jestem na miejscu',
      done === TASK_COUNT ? 'Przejdź do protokołu' : `Odhacz zadania (${done}/${TASK_COUNT})`,
      signed ? 'Zakończ zlecenie' : 'Poproś klienta o podpis',
      'Otwórz następne zlecenie',
    ][step]!,
    log: [
      '07:40 · ekipa Marka wyjechała · klient dostał SMS',
      `08:05 · na miejscu · ${photosLabel} · ${done}/${TASK_COUNT} zadań`,
      signed
        ? '12:10 · protokół podpisany · PDF wysłany do klienta'
        : '12:05 · protokół czeka na podpis klienta',
      '12:12 · zakończone · materiały rozliczone · faktura do wystawienia',
    ][step]!,
    cardA: [
      { title: 'Klient dostał SMS', text: '„Ekipa będzie o 8:00”' },
      { title: 'Zdjęcia doszły do biura', text: `${photosLabel} · bez zasięgu też` },
      signed
        ? { title: 'Protokół PDF u klienta', text: 'i w biurze, w tej samej sekundzie' }
        : { title: 'Czekamy na podpis', text: 'klient podpisuje palcem' },
      { title: 'Faktura jednym kliknięciem', text: 'dane już w Twoim programie' },
    ][step]!,
    cardB: [
      { title: 'Nawigacja i kod do bramy', text: 'nikt nie dzwoni z pytaniem „gdzie to”' },
      { title: `${done}/${TASK_COUNT} zadań odhaczonych`, text: 'biuro widzi postęp na żywo' },
      { title: 'Materiały rozliczone', text: 'płytki 12 m², fuga 2 op.' },
      { title: 'Następne zlecenie gotowe', text: 'Taras · Lis · 13:00' },
    ][step]!,
    hint: state.touched
      ? 'Twój wybór. Klikaj po telefonie.'
      : 'Przechodzi samo. Kliknij, żeby przejąć.',
    protocol: `${done}/${TASK_COUNT} ${plural(done, ['zadanie', 'zadania', 'zadań'])} · ${photosLabel} · materiały zużyte`,
    columns: [2, step === 0 ? 2 : 1, step === 1 || step === 2 ? 2 : 1, step === 3 ? 4 : 3],
  }
}
