
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { ToggleButton } from "./ProductHelpers";
import { FEATURE_CATEGORIES } from "./constants";

// ==============================================================================
// FeatureManager - Gestor de características
// ==============================================================================
interface FeatureManagerProps {
    features: string[];
    onFeaturesChange: (features: string[]) => void;
}

type FeatureCategoryKey = keyof typeof FEATURE_CATEGORIES;

export function FeatureManager({
    features,
    onFeaturesChange,
}: FeatureManagerProps) {
    const [newFeature, setNewFeature] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("todos");

    const toggleFeature = (feature: string) => {
        if (features.includes(feature)) {
            onFeaturesChange(features.filter((f) => f !== feature));
        } else {
            onFeaturesChange([...features, feature]);
        }
    };

    const addCustomFeature = () => {
        if (newFeature.trim()) {
            const f = newFeature.trim();
            if (!features.includes(f)) toggleFeature(f);
            setNewFeature("");
        }
    };

    const allFeatures = Object.values(FEATURE_CATEGORIES).flatMap(
        (cat) => cat.items
    );

    const displayFeatures = useMemo(() => {
        if (selectedCategory === "todos") return allFeatures.slice(0, 30); // Limit full display
        return (
            FEATURE_CATEGORIES[selectedCategory as FeatureCategoryKey]?.items || []
        );
    }, [selectedCategory, allFeatures]);

    return (
        <div className="space-y-5">
            {/* Configuración Tabs */}
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                <button
                    type="button"
                    onClick={() => setSelectedCategory("todos")}
                    className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap",
                        selectedCategory === "todos"
                            ? "bg-primary text-white border-primary"
                            : "bg-surface border-muted hover:border-primary"
                    )}
                >
                    Todos
                </button>
                {Object.entries(FEATURE_CATEGORIES).map(([key, cat]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedCategory(key)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap",
                            selectedCategory === key
                                ? "bg-primary text-white border-primary"
                                : "bg-surface border-muted hover:border-primary"
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {displayFeatures.map((feature) => (
                    <ToggleButton
                        key={feature}
                        label={feature}
                        selected={features.includes(feature)}
                        onClick={() => toggleFeature(feature)}
                    />
                ))}
            </div>

            {/* Manual Add */}
            <div className="flex gap-2">
                <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Otra característica..."
                    className="flex-1"
                    onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addCustomFeature())
                    }
                />
                <Button
                    type="button"
                    onClick={addCustomFeature}
                    variant="outline"
                    className="h-10 w-10 p-2"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
