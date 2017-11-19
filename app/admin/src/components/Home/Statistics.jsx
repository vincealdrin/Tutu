import React from 'react';
import { Grid, Statistic, Icon, Segment } from 'semantic-ui-react';

const Statistics = ({ views, articles, sources }) => (
  <Grid columns={3}>
    <Grid.Column>
      <Segment>
        <Statistic size="tiny">
          <Statistic.Value>
            <Icon name="eye" />
              84
          </Statistic.Value>
          <Statistic.Label>Views</Statistic.Label>
        </Statistic>
      </Segment>
    </Grid.Column>
    <Grid.Column>
      <Segment>
        <Statistic size="tiny">
          <Statistic.Value>
            <Icon name="newspaper" />
              10,312
          </Statistic.Value>
          <Statistic.Label>News Articles</Statistic.Label>
        </Statistic>
      </Segment>
    </Grid.Column>
    <Grid.Column>
      <Segment>
        <Statistic size="tiny">
          <Statistic.Value>
            <Icon name="world" />
                      298
          </Statistic.Value>
          <Statistic.Label>News Site Sources</Statistic.Label>
        </Statistic>
      </Segment>
    </Grid.Column>
  </Grid>
);

export default Statistics;
