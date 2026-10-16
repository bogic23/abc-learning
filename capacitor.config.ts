import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.abc.personaldashboard',
  appName: 'moodle-learn',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com', 'password'],
    },
  },
};

export default config;
