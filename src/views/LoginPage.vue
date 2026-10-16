<template>
  <ion-page>
    <ion-content class="auth-content" :scroll-y="false">
      <!-- Ambient background -->
      <div class="bg-scene" aria-hidden="true">
        <div class="bg-gradient"></div>
        <div class="blob blob-a anim-blob"></div>
        <div class="blob blob-b anim-blob"></div>
        <div class="blob blob-c"></div>
        <div class="grid-overlay"></div>
      </div>

      <div class="auth-scroll">
        <div class="auth-container">
          <!-- Brand -->
          <div class="brand-section anim-fade-slide">
            <div class="logo-wrap anim-float">
              <div class="logo-ring"></div>
              <div class="logo-core">
                <ion-icon :icon="schoolOutline" />
              </div>
            </div>
            <h1>Moodle Learn</h1>
            <p>Your academic companion · secured by Firebase</p>
          </div>

          <!-- Card -->
          <div
            ref="cardRef"
            class="auth-card anim-fade-slide pressable-none"
            :class="{ 'anim-shake': shakeActive }"
            style="animation-delay: 90ms"
          >
            <!-- Mode toggle -->
            <div class="seg" role="tablist" aria-label="Login or register">
              <div class="seg-thumb" :class="mode === 'register' ? 'right' : 'left'"></div>
              <button :class="{ active: mode === 'login' }" @click="setMode('login')" role="tab">Sign in</button>
              <button :class="{ active: mode === 'register' }" @click="setMode('register')" role="tab">Register</button>
            </div>

            <h2 class="card-title">{{ mode === 'login' ? 'Welcome back' : 'Create your account' }}</h2>
            <p class="card-sub">
              {{ mode === 'login' ? 'Sign in with your Firebase account.' : 'Join as a student or teacher in seconds.' }}
            </p>

            <!-- Role picker (register) -->
            <transition name="collapse">
              <div v-if="mode === 'register'" class="role-row">
                <button
                  v-for="r in roleOptions"
                  :key="r"
                  class="role-chip pressable"
                  :class="{ selected: chosenRole === r }"
                  @click="chosenRole = r; buzz('light')"
                >
                  <ion-icon :icon="r === 'student' ? bookOutline : briefcaseOutline" />
                  <span>{{ r === 'student' ? 'Student' : 'Teacher' }}</span>
                  <ion-icon v-if="chosenRole === r" :icon="checkmarkCircle" class="check" />
                </button>
              </div>
            </transition>

            <div class="fields stagger">
              <transition name="collapse">
                <div v-if="mode === 'register'" class="field field-focus" style="--i: 0">
                  <ion-icon :icon="personOutline" class="field-icon" />
                  <ion-input
                    v-model="displayName"
                    label="Full name"
                    label-placement="stacked"
                    placeholder="Ada Lovelace"
                    autocomplete="name"
                  />
                </div>
              </transition>

              <div class="field field-focus" style="--i: 1">
                <ion-icon :icon="mailOutline" class="field-icon" />
                <ion-input
                  v-model="email"
                  type="email"
                  label="Email"
                  label-placement="stacked"
                  placeholder="you@campus.edu"
                  autocomplete="email"
                  inputmode="email"
                />
              </div>

              <div class="field field-focus" style="--i: 2">
                <ion-icon :icon="lockClosedOutline" class="field-icon" />
                <ion-input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  label="Password"
                  label-placement="stacked"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  @keyup.enter="handlePrimary"
                />
                <button class="eye pressable" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Hide password' : 'Show password'">
                  <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" />
                </button>
              </div>
            </div>

            <!-- Password strength (register only) -->
            <transition name="collapse">
              <div v-if="mode === 'register'" class="strength">
                <div class="bars">
                  <span v-for="i in 4" :key="i" class="bar" :class="{ on: i <= strengthScore, weak: strengthScore <= 1, good: strengthScore >= 3 }"></span>
                </div>
                <small>{{ strengthLabel }}</small>
              </div>
            </transition>

            <!-- Error -->
            <transition name="collapse">
              <div v-if="authError" class="error-banner anim-pop">
                <ion-icon :icon="alertCircleOutline" />
                <span>{{ authError }}</span>
              </div>
            </transition>

            <ion-button expand="block" class="primary-btn btn-shine pressable" :disabled="authLoading || !canSubmit" @click="handlePrimary">
              <ion-spinner v-if="authLoading" name="crescent" class="btn-spinner" />
              <span v-else>{{ mode === 'login' ? 'Sign in' : 'Create account' }}</span>
              <ion-icon v-if="!authLoading" :icon="arrowForwardOutline" slot="end" />
            </ion-button>

            <div class="divider"><span>or continue with</span></div>

            <ion-button expand="block" fill="outline" class="google-btn pressable" :disabled="authLoading" @click="handleGoogle">
              <span class="g-logo" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.6 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.5 21.3 7.5 24 12 24z"/><path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.6-2.8-.1.1C.5 8.7 0 10.2 0 12s.5 3.3 1.4 4.9l3.8-2.5z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.7 1.4 6.7l3.8 2.9c.9-2.8 3.6-4.9 6.8-4.9z"/></svg>
              </span>
              Continue with Google
            </ion-button>

            <p class="switch-line">
              {{ mode === 'login' ? "New here?" : 'Already have an account?' }}
              <a @click="setMode(mode === 'login' ? 'register' : 'login')">{{ mode === 'login' ? 'Create one' : 'Sign in' }}</a>
            </p>
          </div>

          <p class="foot anim-fade-slide" style="animation-delay: 180ms">
            <ion-icon :icon="shieldCheckmarkOutline" /> Protected with Firebase Authentication
          </p>
        </div>
      </div>

      <ion-toast
        :is-open="toast.open"
        :message="toast.msg"
        :color="toast.color"
        :duration="2200"
        @didDismiss="toast.open = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonContent, IonInput, IonButton, IonIcon, IonSpinner, IonToast,
} from '@ionic/vue';
import {
  schoolOutline, bookOutline, briefcaseOutline, personOutline, mailOutline,
  lockClosedOutline, eyeOutline, eyeOffOutline, arrowForwardOutline,
  alertCircleOutline, checkmarkCircle, shieldCheckmarkOutline,
} from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAuth, type UserRole } from '@/composables/useAuth';

const router = useRouter();
const { signIn, signUp, signInWithGoogle, authLoading, authError } = useAuth();

const mode = ref<'login' | 'register'>('login');
const roleOptions: UserRole[] = ['student', 'teacher'];
const displayName = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const chosenRole = ref<UserRole>('student');
const shakeActive = ref(false);
const cardRef = ref<HTMLElement | null>(null);
const toast = ref({ open: false, msg: '', color: 'success' as string });

const buzz = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
  try {
    await Haptics.impact({
      style: style === 'light' ? ImpactStyle.Light : style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy,
    });
  } catch { /* web without haptics */ }
};

const setMode = (m: 'login' | 'register') => {
  if (mode.value === m) return;
  mode.value = m;
  buzz('light');
};

const emailValid = computed(() => /.+@.+\..+/.test(email.value.trim()));
const canSubmit = computed(() => {
  if (!emailValid.value || password.value.length < 6) return false;
  if (mode.value === 'register' && displayName.value.trim().length < 2) return false;
  return true;
});

const strengthScore = computed(() => {
  const p = password.value;
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(4, s);
});
const strengthLabel = computed(() => {
  if (!password.value) return 'Use 6+ characters with a mix of cases, numbers & symbols';
  return ['Too weak', 'Weak', 'Okay', 'Strong', 'Excellent'][strengthScore.value];
});

const fail = async (msg?: string) => {
  shakeActive.value = false;
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  shakeActive.value = true;
  setTimeout(() => (shakeActive.value = false), 550);
  await buzz('heavy');
  if (msg) toast.value = { open: true, msg, color: 'danger' };
};

const goToDashboard = (role: UserRole | null) => {
  router.replace(role === 'teacher' ? '/teacher' : '/student');
};

const handlePrimary = async () => {
  await buzz('medium');
  if (!canSubmit.value) {
    await fail('Please complete the form correctly first.');
    return;
  }
  try {
    if (mode.value === 'login') {
      const r = await signIn(email.value, password.value);
      toast.value = { open: true, msg: 'Welcome back!', color: 'success' };
      await buzz('light');
      goToDashboard(r);
    } else {
      const r = await signUp(displayName.value, email.value, password.value, chosenRole.value);
      toast.value = { open: true, msg: `Account created — welcome, ${displayName.value.split(' ')[0] || 'learner'}!`, color: 'success' };
      await buzz('light');
      goToDashboard(r);
    }
  } catch {
    await fail();
  }
};

const handleGoogle = async () => {
  await buzz('medium');
  localStorage.setItem('pending_role', mode.value === 'register' ? chosenRole.value : (localStorage.getItem('user_role') as UserRole) || 'student');
  try {
    const r = await signInWithGoogle(chosenRole.value);
    if (!r) return; // cancelled
    toast.value = { open: true, msg: 'Signed in with Google', color: 'success' };
    goToDashboard(r);
  } catch {
    await fail();
  }
};
</script>

<style scoped>
.auth-content { --background: #0b1e3a; }
.auth-scroll { height: 100%; overflow-y: auto; position: relative; z-index: 1; }

/* Ambient */
.bg-scene { position: fixed; inset: 0; overflow: hidden; z-index: 0; }
.bg-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, #0b1e3a, #1e3a5f 45%, #2a4a73 70%, #0b1e3a);
  background-size: 220% 220%;
  animation: gradientPan 14s ease-in-out infinite;
}
.blob { position: absolute; border-radius: 50%; filter: blur(70px); opacity: 0.55; }
.blob-a { width: 340px; height: 340px; left: -90px; top: -70px; background: #3b82f6; }
.blob-b { width: 300px; height: 300px; right: -80px; top: 22%; background: #e8a838; opacity: 0.42; animation-delay: -4s; }
.blob-c { width: 420px; height: 420px; left: 10%; bottom: -180px; background: #7c3aed; opacity: 0.35; animation: blobDrift 16s ease-in-out infinite; }
.grid-overlay {
  position: absolute; inset: 0; opacity: 0.14;
  background-image: linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse 90% 70% at 50% 20%, black 30%, transparent 75%);
}

.auth-container { max-width: 440px; margin: 0 auto; padding: 40px 20px 28px; }

/* Brand */
.brand-section { text-align: center; color: #fff; margin-bottom: 22px; }
.logo-wrap { position: relative; width: 92px; height: 92px; margin: 0 auto 14px; }
.logo-ring { position: absolute; inset: 0; border-radius: 28px; border: 1.5px solid rgba(255,255,255,.35); animation: spinSlow 14s linear infinite; }
.logo-core {
  position: absolute; inset: 10px; border-radius: 22px;
  background: rgba(255,255,255,.14); backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,.25);
  display: flex; align-items: center; justify-content: center;
  animation: pulseRing 2.6s ease-out infinite;
}
.logo-core ion-icon { font-size: 38px; color: #ffd88a; }
.brand-section h1 { font-size: 30px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
.brand-section p { opacity: 0.75; font-size: 13.5px; margin: 6px 0 0; }

/* Card */
.auth-card {
  background: rgba(255,255,255,.97);
  border-radius: 28px; padding: 22px 20px 20px;
  box-shadow: 0 24px 70px rgba(0,0,0,.35);
  border: 1px solid rgba(255,255,255,.6);
}
@media (prefers-color-scheme: dark) {
  .auth-card { background: rgba(17,25,40,.96); border-color: rgba(255,255,255,.08); color: #e2e8f0; }
  .card-sub { color: #94a3b8 !important; }
  .field { background: #0f172a !important; }
  .switch-line { color: #94a3b8; }
}
.card-title { font-size: 21px; font-weight: 800; margin: 14px 2px 2px; letter-spacing: -0.3px; }
.card-sub { font-size: 13.5px; color: #64748b; margin: 0 2px 14px; }

/* Segmented */
.seg { position: relative; display: grid; grid-template-columns: 1fr 1fr; background: #eef2f7; border-radius: 16px; padding: 4px; }
.seg button { position: relative; z-index: 1; border: 0; background: transparent; padding: 10px; border-radius: 12px; font-weight: 700; font-size: 14px; color: #64748b; cursor: pointer; transition: color 200ms ease; }
.seg button.active { color: #0b1e3a; }
.seg-thumb { position: absolute; top: 4px; bottom: 4px; width: calc(50% - 4px); background: #fff; border-radius: 12px; box-shadow: 0 4px 14px rgba(11,30,58,.15); transition: transform 320ms var(--ease-spring); }
.seg-thumb.left { transform: translateX(4px); }
.seg-thumb.right { transform: translateX(calc(100% + 4px)); }

/* Role chips */
.role-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.role-chip {
  display: flex; align-items: center; gap: 8px; justify-content: center;
  border: 1.5px solid #e2e8f0; background: #f8fafc; color: #334155;
  border-radius: 14px; padding: 11px; font-weight: 700; font-size: 13.5px; cursor: pointer;
  transition: all 220ms var(--ease-out);
}
.role-chip ion-icon { font-size: 18px; }
.role-chip.selected { border-color: #1e3a5f; background: #1e3a5f; color: #fff; box-shadow: 0 8px 20px rgba(30,58,95,.3); }
.role-chip .check { color: #ffd88a; }

/* Fields */
.fields { display: flex; flex-direction: column; gap: 10px; }
.field {
  display: flex; align-items: center; gap: 6px;
  background: #f1f5f9; border-radius: 16px; padding: 2px 12px 2px 6px;
  border: 1.5px solid transparent;
}
.field-icon { font-size: 20px; color: #1e3a5f; margin-left: 8px; flex-shrink: 0; }
.field ion-input { flex: 1; --padding-start: 4px; }
.eye { border: 0; background: transparent; font-size: 20px; color: #64748b; padding: 10px 6px; cursor: pointer; }

/* Strength */
.strength { display: flex; align-items: center; gap: 10px; margin: 10px 2px 0; }
.bars { display: flex; gap: 5px; flex: 1; }
.bar { height: 6px; flex: 1; border-radius: 4px; background: #e2e8f0; transition: background 250ms ease; }
.bar.on { background: #e8a838; }
.bar.on.good { background: #2d8a5e; }
.bar.on.weak { background: #c44545; }
.strength small { color: #64748b; font-size: 11.5px; }

/* Error */
.error-banner {
  display: flex; gap: 8px; align-items: flex-start;
  background: #fef2f2; color: #991b1b; border: 1px solid #fecaca;
  font-size: 13px; border-radius: 14px; padding: 10px 12px; margin-top: 12px;
}
.error-banner ion-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

/* Buttons */
.primary-btn { --border-radius: 16px; --background: linear-gradient(135deg, #1e3a5f, #2f5b94); min-height: 52px; margin-top: 16px; font-weight: 700; }
.primary-btn:disabled { opacity: 0.55; }
.btn-spinner { width: 22px; height: 22px; }
.divider { display: flex; align-items: center; gap: 12px; margin: 16px 2px 12px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: .6px; }
.divider::before, .divider::after { content: ''; height: 1px; flex: 1; background: #e2e8f0; }
.google-btn { --border-radius: 16px; min-height: 50px; --border-color: #cbd5e1; --color: #0f172a; font-weight: 700; }
.g-logo { display: inline-flex; margin-right: 8px; }
.switch-line { text-align: center; font-size: 13.5px; color: #475569; margin: 14px 0 2px; }
.switch-line a { color: #1e3a5f; font-weight: 800; cursor: pointer; margin-left: 4px; }
.foot { display: flex; align-items: center; justify-content: center; gap: 6px; color: rgba(255,255,255,.7); font-size: 12px; margin-top: 18px; }

/* Collapse transition */
.collapse-enter-active, .collapse-leave-active { transition: all 300ms var(--ease-out); overflow: hidden; }
.collapse-enter-from, .collapse-leave-to { opacity: 0; max-height: 0; transform: translateY(-6px); }
.collapse-enter-to, .collapse-leave-from { opacity: 1; max-height: 220px; }
</style>
