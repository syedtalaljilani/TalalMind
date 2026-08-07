import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { TimelineScreen } from "./src/screens/TimelineScreen";
import { LessonsScreen } from "./src/screens/LessonsScreen";
import { ChecklistsScreen } from "./src/screens/ChecklistsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { ProductivityScreen } from "./src/screens/ProductivityScreen";
import { AchievementsScreen } from "./src/screens/AchievementsScreen";
import { FocusShieldScreen } from "./src/screens/FocusShieldScreen";
import { StorageService, getTodayDateString } from "./src/services/storageService";
import { AutoBlockService } from "./src/services/autoBlockService";
import { NotificationService } from "./src/services/notificationService";

type IconName = keyof typeof Ionicons.glyphMap;

type ScreenEntry = {
  key: string;
  label: string;
  icon: IconName;
  activeIcon: IconName;
  component: React.ComponentType;
};

const screens: ScreenEntry[] = [
  {
    key: "Timeline",
    label: "Home",
    icon: "time-outline" as IconName,
    activeIcon: "time" as IconName,
    component: TimelineScreen,
  },
  {
    key: "Productivity",
    label: "Boost",
    icon: "hourglass-outline" as IconName,
    activeIcon: "hourglass" as IconName,
    component: ProductivityScreen,
  },
  {
    key: "Achievements",
    label: "Badges",
    icon: "trophy-outline" as IconName,
    activeIcon: "trophy" as IconName,
    component: AchievementsScreen,
  },
  {
    key: "Lessons",
    label: "Learn",
    icon: "book-outline" as IconName,
    activeIcon: "book" as IconName,
    component: LessonsScreen,
  },
  {
    key: "Checklists",
    label: "Tasks",
    icon: "checkbox-outline" as IconName,
    activeIcon: "checkbox" as IconName,
    component: ChecklistsScreen,
  },
  {
    key: "Settings",
    label: "Settings",
    icon: "settings-outline" as IconName,
    activeIcon: "settings" as IconName,
    component: SettingsScreen,
  },
];

function BottomTabBar({
  screens,
  activeScreen,
  onSelect,
}: {
  screens: ScreenEntry[];
  activeScreen: string;
  onSelect: (key: string) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.tabBar}>
        {screens.map((screen) => {
          const selected = screen.key === activeScreen;
          return (
            <TouchableOpacity
              key={screen.key}
              onPress={() => onSelect(screen.key)}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.tabIconWrap,
                  selected && styles.tabIconWrapActive,
                ]}
              >
                <Ionicons
                  name={selected ? screen.activeIcon : screen.icon}
                  size={22}
                  color={selected ? "#F8FAFC" : "#64748B"}
                />
              </View>
              <Text
                style={[styles.tabLabel, selected && styles.tabLabelActive]}
              >
                {screen.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState("Timeline");
  const [shieldOpen, setShieldOpen] = useState(false);

  useEffect(() => {
    StorageService.init();
    AutoBlockService.start();
    void (async () => {
      await NotificationService.ensurePermissions();
      const [settings, timings] = await Promise.all([
        StorageService.getSettings(),
        StorageService.getCachedPrayerTimes(getTodayDateString()),
      ]);
      await NotificationService.reschedule(timings ?? undefined, settings);
    })();
  }, []);

  const activeScreenObj = screens.find((screen) => screen.key === activeScreen);
  const ActiveComponent = activeScreenObj?.component || TimelineScreen;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.appContainer} edges={["top", "left", "right"]}>
        <StatusBar style="light" />
        <View style={styles.contentArea}>
          {activeScreen === "Settings" ? (
            <SettingsScreen onOpenShield={() => setShieldOpen(true)} />
          ) : (
            <ActiveComponent />
          )}
        </View>
        <BottomTabBar
          screens={screens}
          activeScreen={activeScreen}
          onSelect={setActiveScreen}
        />
      </SafeAreaView>
      <Modal
        visible={shieldOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShieldOpen(false)}
      >
        <FocusShieldScreen onClose={() => setShieldOpen(false)} />
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "#090A0F",
  },
  contentArea: {
    flex: 1,
    backgroundColor: "#090A0F",
  },
  tabBarContainer: {
    paddingTop: 8,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F1424",
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 4,
  },
  tabIconWrap: {
    width: 40,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconWrapActive: {
    backgroundColor: "rgba(99, 102, 241, 0.28)",
  },
  tabLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: "#F8FAFC",
  },
});
