
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MotionCardProps extends React.ComponentProps<typeof Card> {
    delay?: number;
    children: React.ReactNode;
}

export function MotionCard({ className, delay = 0, children, ...props }: MotionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay, ease: "easeOut" }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="h-full"
        >
            <Card
                className={cn(
                    "h-full overflow-hidden glass-card hover:-translate-y-1 hover:shadow-xl hover:border-primary/30",
                    className
                )}
                {...props}
            >
                {children}
            </Card>
        </motion.div>
    );
}

export { CardHeader, CardTitle, CardContent, CardDescription, CardFooter };
