<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <div class="avatar-sm anim-pop">{{ userName.charAt(0).toUpperCase() }}</div>
        <ion-title>Student Dashboard</ion-title>
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

      <!-- Greeting -->
      <div class="greeting-section anim-fade-slide">
        <p class="eyebrow">{{ greet }},</p>
        <h2>{{ userName }}</h2>
        <p class="sub">Here's your learning overview</p>
      </div>

      <!-- Stats -->
      <div v-if="isLoading" class="stats-grid">
        <div class="skeleton sk-stat"></div>
        <div class="skeleton sk-stat"></div>
      </div>
      <div v-else class="stats-grid stagger">
        <div class="stat-card pressable anim-pop" style="--i: 0">
          <div class="stat-top"><ion-icon :icon="bookOutline" /><span class="pill">+2 this term</span></div>
          <h2>{{ coursesCount }}</h2>
          <p>Enrolled Courses</p>
        </div>
        <div class="stat-card secondary pressable anim-pop" style="--i: 1">
          <div class="stat-top"><ion-icon :icon="clipboardOutline" /><span class="pill warn">{{ pendingAssignments }} due</span></div>
          <h2>{{ pendingAssignments }}</h2>
          <p>Pending Tasks</p>
        </div>
      </div>

      <!-- Upcoming -->
      <div class="section-header anim-fade-slide" style="animation-delay: 120ms">
        <h3>Upcoming Assignments</h3>
        <ion-chip color="primary" outline>{{ assignments.length }} open</ion-chip>
      </div>

      <div v-if="isLoading" class="course-list">
        <div class="skeleton sk-row"></div>
        <div class="skeleton sk-row"></div>
        <div class="skeleton sk-row"></div>
      </div>
      <ion-list v-else lines="none" class="course-list stagger">
        <ion-item
          v-for="(a, i) in assignments"
          :key="a.id"
          class="assignment-item pressable anim-fade-slide"
          :style="{ '--i': i }"
          button
          @click="tapAssignment(a)"
        >
          <div class="assignment-icon" :class="a.urgency">
            <ion-icon :icon="documentTextOutline" />
          </div>
          <ion-label>
            <h4>{{ a.title }}</h4>
            <p>{{ a.course }}</p>
            <p class="due-date">Due: {{ a.dueDate }}</p>
          </ion-label>
          <ion-badge :color="a.urgency === 'high' ? 'danger' : a.urgency === 'medium' ? 'warning' : 'success'" slot="end" class="anim-pop">
            {{ a.daysLeft }}d
          </ion-badge>
        </ion-item>
      </ion-list>

      <!-- Courses -->
      <div class="section-header anim-fade-slide" style="animation-delay: 160ms">
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
          <div class="course-color fill-animated" :style="{ background: c.color }"></div>
          <ion-label>
            <h4>{{ c.name }}</h4>
            <div class="progress-row">
              <ion-progress-bar :value="c.progress / 100" :color="c.progress > 70 ? 'success' : 'primary'" class="grow-bar" />
              <small>{{ c.progress }}%</small>
            </div>
          </ion-label>
          <ion-icon :icon="chevronForwardOutline" slot="end" class="chev" />
        </ion-item>
      </ion-list>

      <div class="bottom-pad"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonIcon, IonButton, IonButtons,
  IonBadge, IonProgressBar, IonRefresher, IonRefresherContent, IonChip,
} from '@ionic/vue';
import {
  logOutOutline, bookOutline, clipboardOutline, documentTextOutline, chevronForwardOutline,
} from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAuth } from '@/composables/useAuth';
import { useCountUp, useFakeLoading, greeting } from '@/composables/useDashboardFx';

const router = useRouter();
const { signOut } = useAuth();
const userName = ref(localStorage.getItem('user_name') || 'Student');
const greet = greeting();
const isLoading = useFakeLoading(850);
const coursesCount = useCountUp(5);
const pendingAssignments = ref(3);

const assignments = ref([
  { id: 1, title: 'Data Structures Assignment', course: 'CS201', dueDate: 'Oct 20', daysLeft: 2, urgency: 'high' },
  { id: 2, title: 'Physics Lab Report', course: 'PHY101', dueDate: 'Oct 25', daysLeft: 7, urgency: 'medium' },
  { id: 3, title: 'Essay Draft', course: 'ENG105', dueDate: 'Nov 1', daysLeft: 14, urgency: 'low' },
]);

const courses = ref([
  { id: 1, name: 'Data Structures & Algorithms', progress: 75, color: '#1e3a5f' },
  { id: 2, name: 'Physics I', progress: 45, color: '#e8a838' },
  { id: 3, name: 'Academic English', progress: 90, color: '#2d8a5e' },
]);

const buzz = async () => {
  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch { /* noop */ }
};

const tapAssignment = async (a: any) => {
  await buzz();
  console.log('Open assignment:', a);
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
  background: linear-gradient(135deg, var(--ion-color-primary), #3b82f6);
  color: #fff; font-weight: 800; display: flex; align-items: center; justify-content: center;
}
.greeting-section { padding: 8px 24px 4px; }
.eyebrow { color: #e8a838; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
.greeting-section h2 { font-size: 26px; font-weight: 800; letter-spacing: -0.4px; margin: 2px 0 0; }
.greeting-section .sub { color: #64748b; margin: 4px 0 0; }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; padding: 14px 16px 4px; gap: 12px; }
.stat-card { animation-delay: calc(var(--i, 0) * 90ms); }
.stat-top { display: flex; align-items: center; justify-content: space-between; }
.stat-top ion-icon { font-size: 26px; }
.pill { font-size: 10.5px; font-weight: 800; background: rgba(255,255,255,.22); padding: 3px 8px; border-radius: 99px; }
.pill.warn { background: rgba(30,58,95,.12); }
.stat-card.secondary .pill { background: rgba(30,58,95,.14); }

.section-header { padding: 16px 24px 8px; display: flex; align-items: center; justify-content: space-between; }
.section-header h3 { font-size: 13px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin: 0; }

.course-list { padding: 0 16px; background: transparent; }
.assignment-item, .course-item {
  --background: white; --border-radius: var(--app-border-radius); --padding-start: 14px;
  margin-bottom: 10px; box-shadow: var(--app-card-shadow);
  animation-delay: calc(var(--i, 0) * 80ms);
}
@media (prefers-color-scheme: dark) {
  .assignment-item, .course-item { --background: #111c30; }
  .greeting-section .sub, .section-header h3 { color: #94a3b8; }
  .assignment-icon { background: #1e293b !important; }
}
.assignment-icon {
  width: 42px; height: 42px; border-radius: 13px; display: flex; align-items: center;
  justify-content: center; margin-right: 12px; background: #f1f5f9; color: #1e3a5f; font-size: 20px;
  transition: transform 250ms var(--ease-spring);
}
.assignment-item:active .assignment-icon { transform: rotate(-8deg) scale(1.08); }
.assignment-icon.high { background: #fef2f2; color: #c44545; }
.assignment-icon.medium { background: #fffbeb; color: #b45309; }
.assignment-icon.low { background: #ecfdf5; color: #047857; }

.course-color { width: 6px; min-height: 44px; border-radius: 3px; margin-right: 12px; }
.progress-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.grow-bar { flex: 1; height: 7px; border-radius: 4px; }
.progress-row small { font-weight: 800; color: #64748b; min-width: 36px; text-align: right; }
.chev { color: #cbd5e1; }
.due-date { font-size: 12px; color: #64748b; }

.sk-stat { height: 132px; }
.sk-row { height: 72px; margin: 0 0 10px; }
.bottom-pad { height: 28px; }
</style>
