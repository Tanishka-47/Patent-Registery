import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';

const StatisticsDashboard = ({ patents, transferRequests, auditLogs }) => {
  // Sample data - replace with actual data from props
  const statusData = [
    { status: 'Active', count: patents?.filter(p => p.status === 'active').length || 0 },
    { status: 'Pending', count: patents?.filter(p => p.status === 'pending').length || 0 },
    { status: 'Expired', count: patents?.filter(p => p.status === 'expired').length || 0 },
  ];

  const transferData = [
    { status: 'Pending', count: transferRequests?.filter(t => t.status === 'pending').length || 0 },
    { status: 'Completed', count: transferRequests?.filter(t => t.status === 'completed').length || 0 },
    { status: 'Rejected', count: transferRequests?.filter(t => t.status === 'rejected').length || 0 },
  ];

  const activityData = [
    { date: '2023-01', count: 5 },
    { date: '2023-02', count: 8 },
    { date: '2023-03', count: 12 },
    { date: '2023-04', count: 9 },
    { date: '2023-05', count: 15 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Patent Statistics</Typography>
      
      <Grid container spacing={3}>
        {/* Patent Status */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>Patent Status</Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveBar
                data={statusData}
                keys={['count']}
                indexBy="status"
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                padding={0.3}
                colors={{ scheme: 'nivo' }}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                animate={true}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Transfer Status */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>Transfer Status</Typography>
            <Box sx={{ height: 250 }}>
              <ResponsivePie
                data={transferData.map(item => ({
                  id: item.status,
                  label: item.status,
                  value: item.count,
                }))}
                margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                colors={{ scheme: 'pastel1' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                enableArcLinkLabels={true}
                arcLinkLabel={d => `${d.id}: ${d.value}`}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor="black"
                animate={true}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveLine
                data={[
                  {
                    id: 'activity',
                    data: activityData.map(item => ({
                      x: item.date,
                      y: item.count,
                    })),
                  },
                ]}
                margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{
                  type: 'linear',
                  min: 'auto',
                  max: 'auto',
                  stacked: true,
                  reverse: false
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                colors={{ scheme: 'category10' }}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
                animate={true}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatisticsDashboard;
