import CardContainer from "@/components/CardContainer";
import { Grid, Stack } from "@mui/material";

const Technicians = () => {
    return (
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ width: "100%" }}>
            <Grid size={12}>
                <Stack sx={{ gap: { xs: 2, md: 3 } }}>
                    <CardContainer
                        title="Add a technician"
                        expandable
                    ></CardContainer>
                    <CardContainer
                        title="Technicians"
                        subtitle="2 active · 3 total"
                        displayRow
                    ></CardContainer>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default Technicians;
