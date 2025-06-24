import { type NavItem } from "../types/NavItem";

export const useNavItems = (): NavItem[] => {
    return [
        {
            title: "Dashboard",
            icon: "mdi-view-dashboard",
            to: "/dashboard"
        },
        {
            title: "Queue",
            icon: "mdi-playlist-check",
            to: "/queue"
        },
        {
            title: "Workers",
            icon: "mdi-server",
            to: "/workers"
        },
        {
            title: "Uploads",
            icon: "mdi-cloud-upload",
            to: "/uploads"
        },
        {
            title: "My Media",
            icon: "mdi-folder-multiple",
            to: "/my-media"
        },
        {
            title: "Settings",
            icon: "mdi-cog",
            to: "/settings"
        }
    ];
}