import { RotateCw } from "lucide-react";

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <RotateCw className="animate-spin text-primary w-8 h-8" />
        </div>
    );
}
