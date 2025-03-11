import * as React from "react";
import { VariantProps } from "class-variance-authority";

declare const badgeVariants: (props?: any) => string;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export declare function Badge(props: BadgeProps): React.JSX.Element;

export { badgeVariants }; 