<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <div class="avatar-sm anim-pop">{{ userName.charAt(0).toUpperCase() }}</div>
        <ion-title>Teacher Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button class="pressable" @click="logout" aria-label="Sign out">
            <ion-icon :icon="logOutOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <div class="greeting-section anim-fade-slide">
        <p class="eyebrow">{{ greet }},</p>
        <h2>{{ userName }}</h2>
        <p class="sub">You have <strong>{{ pendingGrading }} submissions</strong> to grade</p>
      </div>

      <div v-if="isLoading" class="stats-grid">
        <div class="skeleton sk-stat"></div>
        <div class="skeleton sk-stat"></div>
      </div>
      <div v-else class="stats-grid stagger">
        <div class="stat-card pressable anim-pop" style="--i: 0">
          <div class="stat-top"><ion-icon :icon="peopleOutline" /><span class="pill">3 courses</span></div>
          <h2>{{ totalStudents }}</h2>
          <p>Total Students</p>
        </div>
        <div class="stat-card secondary pressable anim-pop pulse-attn" style="--i: 1">
          <div class="stat-top"><ion-icon :icon="clipboardOutline" /><span class="pill warn">action needed</span></div>
          <h2>{{ pendingGrading }}</h2>
          <p>Pending Grading</p>
        </div>
      </div>

      <div class="section-header anim-fade-slide" style="animation-delay: 120ms">
        <h3>My Courses</h3>
      </div>

      <div v-if="isLoading" class="course-list">
        <div class="skeleton sk-row"></div>
        <div class="skeleton sk-row"></div>
      </div>
      <ion-list v-else lines="none" class="course-list stagger">
        <ion-item
          v-for="(c, i) in courses"
          :key="c.id"
          class="course-item pressable anim-fade-slide"
          :style="{ '--i': i }"
          button
          @click="buzz"
        >
          <div class="course-color" :style="{ background: c.color }"></div>
          <ion-label>
            <h4>{{ c.name }}</h4>
            <p>{{ c.students }} students · {{ c.submissions }} submissions</p>
          </ion-label>
          <ion-badge color="primary" slot="end" class="anim-pop">{{ c.newSubmissions }} new</ion-badge>
        </ion-item>
      </ion-list>

      <div class="section-header anim-fade-slide" style="animation-delay: 160ms">
        <h3>Recent Submissions</h3>
        <ion-button fill="clear" size="small" class="pressable">View all</ion-button>
      </div>

      <div v-if="isLoading" class="course-list">
        <div class="skeleton sk-row"></div>
        <div class="skeleton sk-row"></div>
      </div>
      <ion-list v-else lines="none" class="course-list stagger">
        <ion-item
          v-for="(s, i) in submissions"
          :key="s.id"
          class="submission-item pressable anim-fade-slide"
          :style="{ '--i': i }"
        >
          <ion-avatar slot="start">
            <div class="avatar-placeholder" :style="{ background: avatarColor(i) }">{{ s.student.charAt(0) }}</div>
          </ion-avatar>
          <ion-label>
            <h4>{{ s.student }}</h4>
            <p>{{ s.assignment }}</p>
            <p class="submission-date">{{ s.submittedAt }}</p>
          </ion-label>
          <ion-button fill="outline" size="small" slot="end" class="grade-btn btn-shine pressable" @click="gradeSubmission(s)">
            Grade
          </ion-button>
        </ion-item>
      </ion-list>

      <div class="bottom-pad"></div>

      <ion-toast :is-open="toast.open" :message="toast.msg" color="success" :duration="1800" @didDismiss="toast.open = false" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonIcon, IonButton, IonButtons,
  IonBadge, IonAvatar, IonRefresher, IonRefresherContent, IonToast,
} from '@ionic/vue';
import { logOutOutline, peopleOutline, clipboardOutline } from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAuth } from '@/composables/useAuth';
import { useCountUp, useFakeLoading, greeting } from '@/composables/useDashboardFx';

const router = useRouter();
const { signOut } = useAuth();
const userName = ref(localStorage.getItem('user_name') || 'Teacher');
const greet = greeting();
const isLoading = useFakeLoading(850);
const totalStudents = useCountUp(124, 1100);
const pendingGrading = ref(18);
const toast = ref({ open: false, msg: '' });

const courses = ref([
  { id: 1, name: 'Data Structures & Algorithms', students: 45, submissions: 12, newSubmissions: 5, color: '#1e3a5f' },
  { id: 2, name: 'Advanced Web Development', students: 38, submissions: 8, newSubmissions: 3, color: '#e8a838' },
  { id: 3, name: 'Database Systems', students: 41, submissions: 15, newSubmissions: 10, color: '#2d8a5e' },
]);

const submissions = ref([
  { id: 1, student: 'Alice Johnson', assignment: 'Binary Trees Implementation', submittedAt: '2 hours ago' },
  { id: 2, student: 'Bob Smith', assignment: 'Graph Algorithms', submittedAt: '5 hours ago' },
  { id: 3, student: 'Carol Davis', assignment: 'Hash Table Analysis', submittedAt: '1 day ago' },
]);

const palette = ['#1e3a5f', '#7c3aed', '#047857', '#b45309', '#0e7490'];
const avatarColor = (i: number) => palette[i % palette.length];

const buzz = async () => {
  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch { /* noop */ }
};

const gradeSubmission = async (s: any) => {
  await buzz();
  toast.value = { open: true, msg: `Opening ${s.student}'s submission…` };
};

const doRefresh = async (e: CustomEvent) => {
  await new Promise((r) => setTimeout(r, 900));
  (e.target as HTMLIonRefresherElement).complete();
};

const logout = async () => {
  await signOut();
  router.replace('/login');
};
</script>

<style scoped>
ion-toolbar { --background: transparent; }
.avatar-sm {
  width: 34px; height: 34px; border-radius: 50%; margin-left: 12px;
  background: linear-gradient(135deg, #e8a838, #f0b94d); color: #1e3a5f;
  font-weight: 800; display: flex; align-items: center; justify-content: center;
}
.greeting-section { padding: 8px 24px 4px; }
.eyebrow { color: #e8a838; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
.greeting-section h2 { font-size: 26px; font-weight: 800; letter-spacing: -0.4px; margin: 2px 0 0; }
.greeting-section .sub { color: #64748b; margin: 4px 0 0; }
.greeting-section .sub strong { color: #1e3a5f; }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; padding: 14px 16px 4px; gap: 12px; }
.stat-card { animation-delay: calc(var(--i, 0) * 90ms); }
.stat-top { display: flex; align-items: center; justify-content: space-between; }
.stat-top ion-icon { font-size: 26px; }
.pill { font-size: 10.5px; font-weight: 800; background: rgba(255,255,255,.22); padding: 3px 8px; border-radius: 99px; }
.pill.warn { background: rgba(30,58,95,.12); }
.pulse-attn { animation: popIn 420ms var(--ease-spring) both, pulseRing 3s ease-out 1.2s infinite; }

.section-header { padding: 16px 24px 8px; display: flex; align-items: center; justify-content: space-between; }
.section-header h3 { font-size: 13px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin: 0; }

.course-list { padding: 0 16px; background: transparent; }
.course-item, .submission-item {
  --background: white; --border-radius: var(--app-border-radius); --padding-start: 14px;
  margin-bottom: 10px; box-shadow: var(--app-card-shadow);
  animation-delay: calc(var(--i, 0) * 80ms);
}
@media (prefers-color-scheme: dark) {
  .course-item, .submission-item { --background: #111c30; }
  .greeting-section .sub, .section-header h3 { color: #94a3b8; }
  .greeting-section .sub strong { color: #ffd88a; }
}
.course-color { width: 6px; min-height: 44px; border-radius: 3px; margin-right: 12px; }
.avatar-placeholder {
  width: 100%; height: 100%; color: white; display: flex; align-items: center;
  justify-content: center; font-weight: 700; border-radius: 50%;
}
.submission-date { font-size: 12px; color: #94a3b8; }
.grade-btn { --border-radius: 10px; font-weight: 700; }
.sk-stat { height: 132px; }
.sk-row { height: 72px; margin: 0 0 10px; }
.bottom-pad { height: 28px; }
</style>
