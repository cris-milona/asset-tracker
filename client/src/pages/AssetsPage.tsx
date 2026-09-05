import { Container, Typography } from '@mui/material';
import AssetList from '../components/AssetList';

const AssetsPage = () => (
  <Container sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom>
      Assets
    </Typography>
    <AssetList />
  </Container>
);

export default AssetsPage;
