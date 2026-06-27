type GoogleCredentialHandler = (idToken: string) => void | Promise<void>;

const handlers: {
  override: GoogleCredentialHandler | null;
  default: GoogleCredentialHandler | null;
} = {
  override: null,
  default: null,
};

let initializedClientId: string | null = null;
let oneTapPromptedThisSession = false;

function dispatchCredential(credential: string) {
  const handler = handlers.override ?? handlers.default;
  void handler?.(credential);
}

export function setGoogleCredentialOverrideHandler(
  handler: GoogleCredentialHandler | null,
) {
  handlers.override = handler;
}

export function setGoogleCredentialDefaultHandler(
  handler: GoogleCredentialHandler | null,
) {
  handlers.default = handler;
}

/** Initialize GIS once per client id (survives React Strict Mode / HMR). */
export function ensureGoogleIdentityInitialized(clientId: string): boolean {
  if (typeof window === "undefined" || !window.google?.accounts?.id) {
    return false;
  }

  if (initializedClientId === clientId) {
    return true;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    auto_select: false,
    cancel_on_tap_outside: true,
    // FedCM on Chrome can abort other GIS flows (incl. sign-in button) on some hosts.
    use_fedcm_for_prompt: false,
    callback: (response) => {
      dispatchCredential(response.credential);
    },
  });
  initializedClientId = clientId;
  return true;
}

export function renderGoogleSignInButton(container: HTMLElement): HTMLElement | null {
  if (!window.google?.accounts?.id) {
    return null;
  }

  container.innerHTML = "";
  window.google.accounts.id.renderButton(container, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signin_with",
    width: 400,
  });

  return container.querySelector('[role="button"]') as HTMLElement | null;
}

/** Show One Tap at most once per full page load. */
export function promptGoogleOneTapOnce(): void {
  if (
    oneTapPromptedThisSession ||
    typeof window === "undefined" ||
    !window.google?.accounts?.id
  ) {
    return;
  }

  oneTapPromptedThisSession = true;
  window.google.accounts.id.prompt();
}

export function cancelGoogleOneTap(): void {
  window.google?.accounts?.id?.cancel?.();
}

/** After logout so a future visit can show One Tap again. */
export function resetGoogleOneTapSession(): void {
  oneTapPromptedThisSession = false;
}
