import React from 'react';
import { Grid, Statistic, Icon, Segment } from 'semantic-ui-react';

const Statistics = ({
  visitors,
  articles,
  pendingSources,
  credibleSources,
  notCredibleSources,

}) => (
  <Grid columns={5}>
    <Grid.Column>
      <Segment>
        <Statistic size="tiny">
          <Statistic.Value>
            <Icon name="eye" />
            {visitors}
          </Statistic.Value>
          <Statistic.Label>Unique Visitors</Statistic.Label>
        </Statistic>
      </Segment>
    </Grid.Column>
    <Grid.Column>
      <Segment>
        <Statistic size="tiny">
          <Statistic.Value>
            <Icon name="newspaper" />
            {articles}
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
            {pendingSources}
          </Statistic.Value>
          <Statistic.Label>Pending Sources</Statistic.Label>
        </Statistic>
      </Segment>
    </Grid.Column>
    <Grid.Column>
      <Segment>
        <Statistic size="tiny">
          <Statistic.Value>
            <Icon name="world" />
            {credibleSources}
          </Statistic.Value>
          <Statistic.Label>Credible Sources</Statistic.Label>
        </Statistic>
      </Segment>
    </Grid.Column>
    <Grid.Column>
      <Segment>
        <Statistic size="tiny">
          <Statistic.Value>
            <Icon name="world" />
            {notCredibleSources}
          </Statistic.Value>
          <Statistic.Label>Not Credible Sources</Statistic.Label>
        </Statistic>
      </Segment>
    </Grid.Column>
  </Grid>
);

export default Statistics;
