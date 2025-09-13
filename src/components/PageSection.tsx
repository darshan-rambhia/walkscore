import { Paper, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

interface PageSectionProps {
  readonly title?: string;
  readonly children: ReactNode;
  readonly minHeight?: number | string;
  readonly pad?: boolean;
  readonly actions?: ReactNode;
}

export default function PageSection({ title, children, minHeight, pad = true, actions }: PageSectionProps) {
  return (
    <Paper sx={{ p: pad ? 2 : 0, minHeight, display: 'flex', flexDirection: 'column' }}>
      {(title || actions) && (
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={pad ? 1.5 : 0} px={pad ? 0 : 2} pt={pad ? 0 : 2}>
          {title && <Typography variant="h6">{title}</Typography>}
          {actions && <Box>{actions}</Box>}
        </Box>
      )}
      <Box flexGrow={1}>{children}</Box>
    </Paper>
  );
}