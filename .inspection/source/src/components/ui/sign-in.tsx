import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BackendError, backendRequest, signedInUser, useSignInChanges } from '@/lib/data';
import { cn } from '@/lib/utils';

/**
 * Sign-in, sign-up and a forgotten password, finished: one centered card in the site's colors and
 * both modes, the right calls and every way they fail said in plain words. Production, 2026-10-16:
 * each app wrote its own form, and a game's account page put a narrow form in the top-left corner
 * of an empty page on an iPad, with none of the game's look.
 *
 * `auth` is `client.auth` from `src/lib/auth.ts` (`wb-backend`), so this file needs nothing installed
 * until the site has sign-in. `onSignedIn` gets the signed-in user after a sign-in, a sign-up (it
 * signs the person in) or a new password.
 *
 *   <SignInScreen auth={client.auth} onSignedIn={setUser} />        a page that is only sign-in
 *   <Sheet open={open} onOpenChange={setOpen} label="Sign in">       beside the button that needs it
 *     <SignInCard auth={client.auth} onSignedIn={done} card={false} />
 *   </Sheet>
 *   <OwnerGate auth={client.auth}><Orders /></OwnerGate>             the owner's page (OWNER-PAGES.md)
 *   <MemberGate auth={client.auth} allow={isStaff}><Today /></MemberGate>   a staff, patient or member page
 *
 * Words follow `<html lang>` (English, or Spanish for `es`); `text` replaces any of them for
 * another language or the site's own voice.
 */

type AuthAnswer = {
  data?: unknown;
  error?: { message?: string; code?: string; status?: number } | null;
};

/** The parts of `client.auth` (@neondatabase/neon-js) this form calls. */
export interface SignInAuth {
  signIn: { email(input: { email: string; password: string }): Promise<AuthAnswer> };
  signUp: { email(input: { email: string; password: string; name: string }): Promise<AuthAnswer> };
  emailOtp: {
    requestPasswordReset(input: { email: string }): Promise<AuthAnswer>;
    resetPassword(input: { email: string; otp: string; password: string }): Promise<AuthAnswer>;
  };
}

export interface SignedInUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

const EN = {
  signInTitle: 'Sign in',
  signUpTitle: 'Create your account',
  forgotTitle: 'Reset your password',
  resetTitle: 'Choose a new password',
  forgotIntro: "We'll email you a 6-digit code.",
  name: 'Your name',
  email: 'Email',
  password: 'Password',
  newPassword: 'New password',
  code: '6-digit code from your email',
  signIn: 'Sign in',
  signUp: 'Create account',
  sendCode: 'Send code',
  save: 'Save and sign in',
  working: 'One moment…',
  forgot: 'Forgot password?',
  newHere: 'New here?',
  createAccount: 'Create an account',
  haveAccount: 'Already have an account?',
  backToSignIn: 'Back to sign in',
  sendNewCode: 'Send a new code',
  show: 'Show',
  hide: 'Hide',
  minLength: 'At least 8 characters',
  codeSent: (email: string) => `We sent a 6-digit code to ${email}. It works for 5 minutes.`,
  resetCodeSent: (email: string) => `If ${email} has an account, a 6-digit code is on its way. It works for 5 minutes.`,
  wrongPassword: "That email and password don't match. Check them, or create an account if you don't have one yet.",
  accountExists: 'There is already an account with this email. Sign in instead.',
  shortPassword: 'Use at least 8 characters for the password.',
  badCode: 'That code is wrong or has expired. Send a new one and try again.',
  tooMany: 'Too many tries right now. Wait a minute and try again.',
  slow: 'The sign-in service is slow right now. Try again in a moment.',
  offline: "Couldn't reach the sign-in service. Check your connection and try again.",
  failed: "That didn't work. Try again.",
  ownerIntro: "Sign in with the owner's email to open this page.",
  confirmTitle: 'Confirm your email',
  confirmIntro: 'This page opens once your email is confirmed.',
  confirm: 'Confirm',
  newCodeSent: 'A new code is on its way.',
  noCode: 'Nothing yet? Check your spam folder, or send a new code.',
  otherEmail: 'Use a different email',
  notOwnerTitle: "This page is for the site's owner",
  signedInAs: (email: string) => `You're signed in as ${email}.`,
  notOwnerPreview: 'Building this site? Ask Anela in the chat to add this email as an owner.',
  notOwnerLive: "If you run this site, sign out and sign in with the owner's email.",
  memberIntro: 'Sign in to open this page.',
  noAccessTitle: "This page isn't open to this account",
  noAccessPreview: 'Building this site? Ask Anela in the chat to give this email access.',
  noAccessLive: 'If you should have access, ask the business to add this email, or sign out and use another account.',
  signOut: 'Sign out',
  tryAgain: 'Try again',
  checkFailed: "We couldn't check who can open this page. Try again in a moment.",
  home: 'Back to the home page',
};

export type SignInText = typeof EN;

const ES: SignInText = {
  signInTitle: 'Inicia sesión',
  signUpTitle: 'Crea tu cuenta',
  forgotTitle: 'Restablece tu contraseña',
  resetTitle: 'Elige una contraseña nueva',
  forgotIntro: 'Te enviaremos un código de 6 dígitos por correo.',
  name: 'Tu nombre',
  email: 'Correo electrónico',
  password: 'Contraseña',
  newPassword: 'Contraseña nueva',
  code: 'Código de 6 dígitos de tu correo',
  signIn: 'Iniciar sesión',
  signUp: 'Crear cuenta',
  sendCode: 'Enviar código',
  save: 'Guardar e iniciar sesión',
  working: 'Un momento…',
  forgot: '¿Olvidaste tu contraseña?',
  newHere: '¿Primera vez aquí?',
  createAccount: 'Crea una cuenta',
  haveAccount: '¿Ya tienes una cuenta?',
  backToSignIn: 'Volver a iniciar sesión',
  sendNewCode: 'Enviar un código nuevo',
  show: 'Mostrar',
  hide: 'Ocultar',
  minLength: 'Al menos 8 caracteres',
  codeSent: (email: string) =>
    `Enviamos un código de 6 dígitos a ${email}. Vale por 5 minutos. El correo con el código llega en inglés.`,
  resetCodeSent: (email: string) =>
    `Si ${email} tiene una cuenta, te llegará un código de 6 dígitos. Vale por 5 minutos. El correo con el código llega en inglés.`,
  wrongPassword: 'Ese correo y esa contraseña no coinciden. Revísalos, o crea una cuenta si aún no tienes una.',
  accountExists: 'Ya hay una cuenta con este correo. Mejor inicia sesión.',
  shortPassword: 'Usa al menos 8 caracteres en la contraseña.',
  badCode: 'Ese código no es válido o ya venció. Pide uno nuevo y vuelve a intentarlo.',
  tooMany: 'Demasiados intentos por ahora. Espera un minuto y vuelve a intentarlo.',
  slow: 'El servicio de inicio de sesión está lento ahora. Vuelve a intentarlo en un momento.',
  offline: 'No pudimos conectar con el servicio de inicio de sesión. Revisa tu conexión y vuelve a intentarlo.',
  failed: 'No funcionó. Vuelve a intentarlo.',
  ownerIntro: 'Inicia sesión con el correo del dueño para abrir esta página.',
  confirmTitle: 'Confirma tu correo',
  confirmIntro: 'Esta página se abre en cuanto confirmes tu correo.',
  confirm: 'Confirmar',
  newCodeSent: 'Ya va en camino un código nuevo.',
  noCode: '¿Todavía nada? Revisa tu carpeta de spam o pide un código nuevo.',
  otherEmail: 'Usar otro correo',
  notOwnerTitle: 'Esta página es para el dueño del sitio',
  signedInAs: (email: string) => `Iniciaste sesión como ${email}.`,
  notOwnerPreview: '¿Estás creando este sitio? Pídele a Anela en el chat que agregue este correo como dueño.',
  notOwnerLive: 'Si administras este sitio, cierra sesión e inicia sesión con el correo del dueño.',
  memberIntro: 'Inicia sesión para abrir esta página.',
  noAccessTitle: 'Esta página no está abierta para esta cuenta',
  noAccessPreview: '¿Estás creando este sitio? Pídele a Anela en el chat que le dé acceso a este correo.',
  noAccessLive: 'Si deberías tener acceso, pide al negocio que agregue este correo, o cierra sesión y usa otra cuenta.',
  signOut: 'Cerrar sesión',
  tryAgain: 'Intentar de nuevo',
  checkFailed: 'No pudimos comprobar quién puede abrir esta página. Inténtalo de nuevo en un momento.',
  home: 'Volver al inicio',
};

function pageText(): SignInText {
  const lang = typeof document === 'undefined' ? '' : document.documentElement.lang.toLowerCase();
  return lang.startsWith('es') ? ES : EN;
}

type Mode = 'signIn' | 'signUp' | 'forgot' | 'reset';

/** Plain words for what the sign-in service answered or threw; its own message otherwise. */
function problemWords(cause: unknown, mode: Mode, t: SignInText): string {
  const failure = (cause ?? {}) as { message?: unknown; code?: unknown; status?: unknown; name?: unknown };
  const message = typeof failure.message === 'string' ? failure.message : '';
  const code = typeof failure.code === 'string' ? failure.code.toUpperCase() : '';
  const status = typeof failure.status === 'number' ? failure.status : 0;
  if (cause instanceof TypeError || /failed to fetch|network|load failed/i.test(message)) return t.offline;
  if (status === 429 || /too many/i.test(message)) return t.tooMany;
  // A timeout or an outage upstream, never the person's code (production 2026-10-23: a 504 during a network
  // outage read "That code is wrong or has expired"). Our edge never retries these: codes are one-use.
  if (status === 502 || status === 503 || status === 504 || /timed? ?out|gateway/i.test(message)) return t.slow;
  if (/ALREADY_EXISTS/.test(code) || /already exists/i.test(message)) return t.accountExists;
  if (/PASSWORD_TOO_SHORT/.test(code) || /password.*(short|least)/i.test(message)) return t.shortPassword;
  if (mode === 'reset' && (/OTP|CODE/.test(code) || /otp|code|expired/i.test(message))) return t.badCode;
  if (/INVALID_EMAIL_OR_PASSWORD|INVALID_PASSWORD|USER_NOT_FOUND/.test(code) || /invalid (email|password)/i.test(message)) {
    return t.wrongPassword;
  }
  return message || t.failed;
}

function userOf(answer: AuthAnswer): SignedInUser | null {
  const user = (answer.data as { user?: SignedInUser } | null | undefined)?.user;
  return user && typeof user.id === 'string' ? user : null;
}

export interface SignInCardProps {
  auth: SignInAuth;
  onSignedIn: (user: SignedInUser | null) => void;
  /** Open on creating an account (a Join or Sign up button) instead of signing in. */
  startWith?: 'signIn' | 'signUp';
  /** A line under the title: what signing in is for ("Sign in to keep your cash"). */
  intro?: ReactNode;
  /** Replace any of the words. */
  text?: Partial<SignInText>;
  /** false inside a Sheet or another surface: the form without its own card. */
  card?: boolean;
  /** The title's level: h1 when the card is the page (SignInScreen), h2 inside a page. */
  heading?: 'h1' | 'h2';
  className?: string;
}

export function SignInCard({
  auth,
  onSignedIn,
  startWith = 'signIn',
  intro,
  text,
  card = true,
  heading = 'h2',
  className,
}: SignInCardProps) {
  const t: SignInText = { ...pageText(), ...text };
  const [mode, setMode] = useState<Mode>(startWith);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [problem, setProblem] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hintId = useId();

  const go = (next: Mode) => {
    setMode(next);
    setProblem('');
    setNotice('');
  };

  const sendCode = async () => {
    const { error } = await auth.emailOtp.requestPasswordReset({ email });
    if (error) throw error;
    setMode('reset');
    setProblem('');
    // The sign-in service answers the same for an email with no account, and sends nothing:
    // a mistyped address must not read as a code on its way (audit 2026-10-18..20, U12).
    setNotice(t.resetCodeSent(email));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setProblem('');
    try {
      if (mode === 'forgot') {
        await sendCode();
        return;
      }
      let answer: AuthAnswer;
      if (mode === 'signUp') {
        answer = await auth.signUp.email({ email, password, name: name.trim() || email.split('@')[0] || email });
      } else {
        if (mode === 'reset') {
          const reset = await auth.emailOtp.resetPassword({ email, otp: code.trim(), password });
          if (reset.error) throw reset.error;
        }
        answer = await auth.signIn.email({ email, password });
      }
      if (answer.error) throw answer.error;
      setNotice('');
      onSignedIn(userOf(answer));
    } catch (cause) {
      setProblem(problemWords(cause, mode, t));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await sendCode();
    } catch (cause) {
      setProblem(problemWords(cause, 'forgot', t));
    } finally {
      setBusy(false);
    }
  };

  const Title = heading;
  const title = { signIn: t.signInTitle, signUp: t.signUpTitle, forgot: t.forgotTitle, reset: t.resetTitle }[mode];
  const action = { signIn: t.signIn, signUp: t.signUp, forgot: t.sendCode, reset: t.save }[mode];
  const field = 'grid gap-1.5 text-[15px] font-medium';

  const form = (
    <form onSubmit={submit} className="grid gap-5">
      <div className="grid gap-2">
        <Title className="text-2xl font-semibold tracking-tight">{title}</Title>
        {mode === 'forgot' ? (
          <p className="text-base opacity-70">{t.forgotIntro}</p>
        ) : (
          intro && mode !== 'reset' && <div className="text-base opacity-70">{intro}</div>
        )}
      </div>
      <div className="grid gap-4">
        {mode === 'signUp' && (
          <label className={field}>
            {t.name}
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </label>
        )}
        <label className={field}>
          {t.email}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            readOnly={mode === 'reset'}
          />
        </label>
        {mode === 'reset' && (
          <label className={field}>
            {t.code}
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              required
            />
          </label>
        )}
        {mode !== 'forgot' && (
          <div className="grid gap-1.5">
            <label className={field}>
              {mode === 'reset' ? t.newPassword : t.password}
              <span className="relative grid">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                  autoCapitalize="none"
                  spellCheck={false}
                  minLength={mode === 'signIn' ? undefined : 8}
                  aria-describedby={mode === 'signIn' ? undefined : hintId}
                  style={{ paddingRight: 76 }}
                  required
                />
                {/* Typing a password on a phone goes wrong; one tap shows what was typed. */}
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-1 my-auto h-11 rounded-full px-3 text-[15px] font-medium text-[var(--brand)]"
                >
                  {showPassword ? t.hide : t.show}
                </button>
              </span>
            </label>
            {/* Said while typing, not after a refused submit; the line stays put so nothing jumps. */}
            {mode !== 'signIn' && (
              <p id={hintId} className={cn('text-[15px]', password.length >= 8 ? 'text-[var(--brand)]' : 'opacity-60')}>
                {password.length >= 8 ? `✓ ${t.minLength}` : t.minLength}
              </p>
            )}
          </div>
        )}
      </div>
      {problem && (
        <p role="alert" className="text-[15px] text-red-600 dark:text-red-400">
          {problem}
        </p>
      )}
      {notice && !problem && (
        <p role="status" className="text-[15px] opacity-80">
          {notice}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? t.working : action}
      </Button>
      <div className="grid justify-items-center gap-1 text-[15px]">
        {mode === 'signIn' && (
          <Button variant="plain" className="h-11" onClick={() => go('forgot')}>
            {t.forgot}
          </Button>
        )}
        {mode === 'reset' && (
          <Button variant="plain" className="h-11" onClick={resend} disabled={busy}>
            {t.sendNewCode}
          </Button>
        )}
        {mode === 'signIn' && (
          <p className="flex flex-wrap items-center justify-center gap-x-1">
            <span className="opacity-70">{t.newHere}</span>
            <Button variant="plain" className="h-11" onClick={() => go('signUp')}>
              {t.createAccount}
            </Button>
          </p>
        )}
        {mode === 'signUp' && (
          <p className="flex flex-wrap items-center justify-center gap-x-1">
            <span className="opacity-70">{t.haveAccount}</span>
            <Button variant="plain" className="h-11" onClick={() => go('signIn')}>
              {t.signIn}
            </Button>
          </p>
        )}
        {(mode === 'forgot' || mode === 'reset') && (
          <Button variant="plain" className="h-11" onClick={() => go('signIn')}>
            {t.backToSignIn}
          </Button>
        )}
      </div>
    </form>
  );

  return card ? (
    <Card className={cn('w-full max-w-sm', className)}>{form}</Card>
  ) : (
    <div className={cn('w-full', className)}>{form}</div>
  );
}

/**
 * A page that is only sign-in: the card centered on the screen at every size, clear of a floating
 * header. `above` goes over the card (the site's name or logo), `below` under it (a link back).
 * Give the page's own background with `className` (a game's dark ground, a photo's wash).
 */
export function SignInScreen({
  above,
  below,
  className,
  ...card
}: Omit<SignInCardProps, 'heading' | 'card' | 'className'> & {
  above?: ReactNode;
  below?: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn('grid min-h-svh place-items-center px-5 pb-10 pt-20', className)}>
      <div className="grid w-full max-w-sm justify-items-center gap-6">
        {above}
        <SignInCard {...card} heading="h1" />
        {below}
      </div>
    </main>
  );
}

/** What OwnerGate calls on `client.auth`, beyond the sign-in form's calls. */
export interface OwnerGateAuth extends SignInAuth {
  emailOtp: SignInAuth['emailOtp'] & {
    sendVerificationOtp(input: { email: string; type: 'email-verification' }): Promise<AuthAnswer>;
    verifyEmail(input: { email: string; otp: string }): Promise<AuthAnswer>;
  };
  signOut(): Promise<unknown>;
}

/**
 * Whether the signed-in person is the site's owner: `public.is_site_admin()` (OWNER-PAGES.md), which
 * reads the database, so it is right the moment an email is confirmed. Signed out, it is false. For a
 * menu link: `isSiteOwner().then(setOwner, () => setOwner(false))`, asked again whenever who is signed
 * in changes.
 */
export async function isSiteOwner(): Promise<boolean> {
  const res = await backendRequest('rpc/is_site_admin', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  });
  return (await res.json()) === true;
}

type Gate = 'checking' | 'signedOut' | 'confirm' | 'notOwner' | 'owner' | 'failed';

/**
 * A CODE THIS TAB SENT IS NOT SENT AGAIN BY A RELOAD. Every new code replaces the last (the login
 * server keeps codes hashed, so it can only make a new one; a code lasts 5 minutes, dev 2026-10-20),
 * and a phone can reload the page while its owner fetches the code from Mail: an automatic send on
 * that reload would refuse the code they just copied. "Send a new code" always sends.
 */
const CODE_SENT_KEY = 'wb-owner-code-sent';
/**
 * MEASURED: a code works for 300 s (dev 2026-10-20). The login service's own email says 10 minutes; that line is
 * wrong. Never change this to 10, even when the owner asks: a site set to 10 stopped sending a new code for the 5
 * minutes after the old one died (production 2026-10-22). Tell the owner codes last 5 minutes.
 */
const CODE_LIFETIME_MS = 5 * 60_000;
const codeStillValid = (email: string): boolean => {
  try {
    const sent = JSON.parse(sessionStorage.getItem(CODE_SENT_KEY) ?? 'null') as { email?: string; at?: number } | null;
    return sent?.email === email && typeof sent.at === 'number' && Date.now() - sent.at < CODE_LIFETIME_MS;
  } catch {
    return false;
  }
};
const rememberCodeSent = (email: string) => {
  try {
    sessionStorage.setItem(CODE_SENT_KEY, JSON.stringify({ email, at: Date.now() }));
  } catch {
    // Storage off (a private window): a reload sends a new code, as before.
  }
};
/** An email confirmed in this tab: the session keeps saying unconfirmed for a while, and a reload then
 * must not ask again. Only the page's door reads it; the database still checks the real state. */
const CONFIRMED_KEY = 'wb-confirmed-email';
const confirmedInTab = (email: string): boolean => {
  try {
    return sessionStorage.getItem(CONFIRMED_KEY) === email;
  } catch {
    return false;
  }
};
const rememberConfirmed = (email: string) => {
  try {
    sessionStorage.setItem(CONFIRMED_KEY, email);
  } catch {
    // Storage off: a reload inside that while asks for a code again.
  }
};

/**
 * AN OWNER OR STAFF PAGE'S DOOR, finished (browser test 2026-10-20: on both sites built that day
 * the owner could not get in. One menu showed the owner page only after the email was confirmed,
 * which only that page could do; the other page told the owner "This page is for the site's owner"
 * and never sent a code). Sign-up sends no code, so every new owner arrives unconfirmed.
 *
 * Signed out: sign in or create an account. Then the owner check; `children` mount only for the
 * owner, so they load their own data then. Not the owner and the email not confirmed: the 6-digit
 * code is sent once and checked here, with "Send a new code" and a way out. Confirmed and still not
 * the owner: who the page is for, and Sign out. `isOwner` replaces the check for a site that asks
 * its own function (`callFunction('owner/me')`), which still refuses non-owners on the server.
 */
export function OwnerGate({
  auth,
  children,
  isOwner = isSiteOwner,
  confirmFirst = false,
  text,
  className,
}: {
  auth: OwnerGateAuth;
  children: ReactNode;
  isOwner?: () => Promise<boolean>;
  /** Ask an unconfirmed email for its code before `isOwner` (`MemberGate`). */
  confirmFirst?: boolean;
  text?: Partial<SignInText>;
  className?: string;
}) {
  const t: SignInText = { ...pageText(), ...text };
  // A gate wrapped around a whole page, the site's header with it, left a bare sign-in box with no way back to the
  // site (production, 2026-10-24, a video app's film page). Without a header on the page, the door links home.
  const [bare, setBare] = useState(false);
  useEffect(() => setBare(!document.querySelector('header')), []);
  // A page for others than the owner (patients, staff, drivers: its own `isOwner`, or `MemberGate`) speaks to anyone:
  // the owner's words on a staff page told a nurse to sign in with the owner's email (production 2026-10-22).
  const forMembers = isOwner !== isSiteOwner;
  const [gate, setGate] = useState<Gate>('checking');
  const [user, setUser] = useState<SignedInUser | null>(null);
  const [code, setCode] = useState('');
  const [problem, setProblem] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const ask = useRef(isOwner);
  ask.current = isOwner;
  /** The email a code went to on this page: sent once, never again on a re-render. */
  const sentTo = useRef('');
  /** Emails confirmed on this page: getSession() keeps saying unconfirmed for up to 15 minutes. */
  const confirmed = useRef(new Set<string>());
  /** Only the newest check may change the page (a sign-in answers twice: its own, and the signal). */
  const latest = useRef(0);
  const signInChanges = useSignInChanges();

  // `known` is the user a sign-in or a confirmation just answered; otherwise ask. The owner check
  // (the database) comes before `emailVerified`, which the session may still have stale.
  const decide = async (known?: SignedInUser | null) => {
    const run = ++latest.current;
    const current = () => run === latest.current;
    setGate('checking');
    setProblem('');
    try {
      const who = known ?? (await signedInUser<SignedInUser>());
      if (!current()) return;
      setUser(who);
      if (!who) {
        setGate('signedOut');
        return;
      }
      // A member page's entries belong to a CONFIRMED email (their bookings, a claim), and `allow` may
      // say yes to anyone signed in: the code comes first (dev3 browser test 2026-10-23: `async () => true`
      // let an unconfirmed neighbor in, and the site refused every Claim, "Confirm your email").
      if (confirmFirst && !who.emailVerified && !confirmed.current.has(who.email) && !confirmedInTab(who.email)) {
        setGate('confirm');
        return;
      }
      let owner: boolean;
      try {
        owner = await ask.current();
      } catch {
        // Its own words: the check is a POST, so the data layer would call it a failed save.
        if (!current()) return;
        setProblem(t.checkFailed);
        setGate('failed');
        return;
      }
      if (!current()) return;
      if (owner) setGate('owner');
      else setGate(who.emailVerified || confirmed.current.has(who.email) ? 'notOwner' : 'confirm');
    } catch (cause) {
      if (!current()) return;
      setProblem(cause instanceof BackendError ? cause.userMessage : problemWords(cause, 'signIn', pageText()));
      setGate('failed');
    }
  };

  // On arriving, and again whenever someone signs in or out on this page (a header's Sign out
  // closes the door, never leaving the owner's rows on a shared screen).
  useEffect(() => {
    void decide();
  }, [signInChanges]);

  const send = async (again: boolean) => {
    if (!user) return;
    setBusy(true);
    setProblem('');
    try {
      const { error } = await auth.emailOtp.sendVerificationOtp({ email: user.email, type: 'email-verification' });
      if (error) throw error;
      rememberCodeSent(user.email);
      setNotice(again ? t.newCodeSent : t.codeSent(user.email));
    } catch (cause) {
      setProblem(problemWords(cause, 'forgot', t));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (gate !== 'confirm' || !user || sentTo.current === user.email) return;
    sentTo.current = user.email;
    if (codeStillValid(user.email)) setNotice(t.codeSent(user.email));
    else void send(false);
  }, [gate, user]);

  const confirm = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || busy) return;
    setBusy(true);
    setProblem('');
    try {
      // A wrong or expired code throws as well as answering an error.
      const answer = await auth.emailOtp.verifyEmail({ email: user.email, otp: code.trim() });
      if (answer.error) throw answer.error;
      confirmed.current.add(user.email);
      rememberConfirmed(user.email);
      setCode('');
      setNotice('');
      await decide({ ...(userOf(answer) ?? user), emailVerified: true });
    } catch (cause) {
      setProblem(problemWords(cause, 'reset', t));
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    const answer = (await auth.signOut().catch((cause: unknown) => ({ error: cause }))) as { error?: unknown } | undefined;
    sentTo.current = '';
    setCode('');
    setNotice('');
    setProblem('');
    setBusy(false);
    // Better Auth answers a failure as `{ error }`: the session may still be there, so ask who is signed in
    // rather than show a signed-out door over a live session.
    if (answer?.error) {
      void decide();
      return;
    }
    setUser(null);
    setGate('signedOut');
  };

  if (gate === 'owner') return <>{children}</>;

  const frame = (inner: ReactNode) => (
    <div className={cn('grid min-h-[70svh] place-items-center px-5 pb-10 pt-24', className)}>
      {bare ? (
        <div className="flex w-full flex-col items-center gap-6">
          {inner}
          <a href="/" className="section-link text-[15px] font-medium">
            {t.home}
          </a>
        </div>
      ) : (
        inner
      )}
    </div>
  );
  if (gate === 'checking') {
    return frame(
      <p role="status" className="text-base opacity-70">
        {t.working}
      </p>,
    );
  }
  if (gate === 'signedOut') {
    return frame(<SignInCard auth={auth} onSignedIn={(signedIn) => void decide(signedIn)} intro={forMembers ? t.memberIntro : t.ownerIntro} text={text} heading="h1" />);
  }
  const alert = problem && (
    <p role="alert" className="text-[15px] text-red-600 dark:text-red-400">
      {problem}
    </p>
  );
  if (gate === 'failed') {
    return frame(
      <Card className="grid w-full max-w-sm gap-5">
        {alert}
        <Button size="lg" className="w-full" onClick={() => void decide()}>
          {t.tryAgain}
        </Button>
      </Card>,
    );
  }
  if (gate === 'notOwner') {
    return frame(
      <Card className="grid w-full max-w-sm gap-5">
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{forMembers ? t.noAccessTitle : t.notOwnerTitle}</h1>
          <p className="text-base opacity-70">{t.signedInAs(user?.email ?? '')}</p>
          {/* A way forward, never the owner's email (OWNER-PAGES): in the preview the builder asks Anela, live
              the owner signs in with theirs (Kendall Eats v2, 2026-10-22: a dead end that needed a prompt). */}
          <p className="text-base opacity-70">
            {forMembers
              ? import.meta.env.DEV
                ? t.noAccessPreview
                : t.noAccessLive
              : import.meta.env.DEV
                ? t.notOwnerPreview
                : t.notOwnerLive}
          </p>
        </div>
        <Button variant="gray" size="lg" className="w-full" onClick={() => void signOut()} disabled={busy}>
          {t.signOut}
        </Button>
      </Card>,
    );
  }
  return frame(
    <Card className="w-full max-w-sm">
      <form onSubmit={confirm} className="grid gap-5">
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t.confirmTitle}</h1>
          <p className="text-base opacity-70">{t.confirmIntro}</p>
        </div>
        <label className="grid gap-1.5 text-[15px] font-medium">
          {t.code}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            required
          />
        </label>
        {alert}
        {notice && !problem && (
          <p role="status" className="text-[15px] opacity-80">
            {notice} {t.noCode}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? t.working : t.confirm}
        </Button>
        <div className="grid justify-items-center gap-1 text-[15px]">
          <Button variant="plain" className="h-11" onClick={() => void send(true)} disabled={busy}>
            {t.sendNewCode}
          </Button>
          <Button variant="plain" className="h-11" onClick={() => void signOut()} disabled={busy}>
            {t.otherEmail}
          </Button>
        </div>
      </form>
    </Card>,
  );
}

/**
 * A PAGE FOR SOME SIGNED-IN PEOPLE (patients, staff, drivers, members, students): `OwnerGate`'s door, with words for
 * anyone rather than the owner, and `allow` saying who may open it: a function of the site's own that the server also
 * enforces (`callFunction('staff/me')`), or `async () => true` for anyone signed in (their own bookings, orders).
 * A list of the person's own ("my bookings") filters by their id in its own query (`user_id=eq.<their id>`): the
 * owner's database rule lets the owner read every row, so without it the owner opening a member page saw every
 * member's bookings, with Cancel on each (production, three times by 2026-10-23).
 * Every member confirms their email with the 6-digit code first (sign-up sends none), so the rows a confirmed email
 * owns open, and so do actions the database allows only to a confirmed email.
 * Its people need a way in from the first build, as the owner's page does: a footer link for everyone, named for them
 * ("Staff"), and in the menu while they are signed in. A climbing gym's staff page with neither was found by nobody,
 * its owner included (dev, 2026-10-23). The gate goes inside the page, under the site's header: around a whole page
 * it hid the header too (a page with no header gets a link home under the sign-in).
 *
 *   <MemberGate auth={client.auth} allow={isStaff}><TodaysAppointments /></MemberGate>
 */
export function MemberGate({
  allow,
  ...props
}: Omit<Parameters<typeof OwnerGate>[0], 'isOwner' | 'confirmFirst'> & { allow: () => Promise<boolean> }) {
  return <OwnerGate {...props} isOwner={allow} confirmFirst />;
}
