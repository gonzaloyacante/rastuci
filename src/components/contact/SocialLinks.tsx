"use client";

import { type ContactSettings } from "@/lib/validation/contact";

export const SocialLinks = ({ contact }: { contact: ContactSettings }) => {
    const socialNetworks = [
        { key: "instagram", icon: "📷", label: "Instagram" },
        { key: "facebook", icon: "👥", label: "Facebook" },
        { key: "whatsapp", icon: "💬", label: "WhatsApp" },
        { key: "tiktok", icon: "🎵", label: "TikTok" },
        { key: "youtube", icon: "▶️", label: "YouTube" },
    ] as const;

    const activeSocial = socialNetworks.filter(
        (network) => contact.social[network.key]?.url && contact.social[network.key]?.username
    );

    if (activeSocial.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4 font-montserrat">Seguinos</h3>
            <div className="flex items-center justify-center flex-wrap gap-4">
                {activeSocial.map((network) => (
                    <a
                        key={network.key}
                        className="flex items-center gap-2 px-4 py-2 surface border border-theme rounded-lg hover:border-primary hover:bg-primary/10 transition-all duration-200"
                        href={contact.social[network.key]?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="text-xl">{network.icon}</span>
                        <div className="text-left">
                            <div className="text-xs text-muted">{network.label}</div>
                            <div className="text-sm font-medium">@{contact.social[network.key]?.username}</div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
