import { styled, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";

/**
 * Enlarged tooltip component.
 * @see https://mui.com/material-ui/api/tooltip/
 */
const BiggerTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        fontSize: 14,
        maxWidth: 350,
    },
}));

export default BiggerTooltip;
