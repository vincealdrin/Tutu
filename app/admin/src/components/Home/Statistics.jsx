import React from 'react';
import { Grid, Statistic, Icon, Segment } from 'semantic-ui-react';

const Statistics = ({
  visitors,
  articles,
  pendingSources,
  legitimateSources,
  illegitimateSources,

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
            {legitimateSources}
          </Statistic.Value>
          <Statistic.Label>Legitimate Sources</Statistic.Label>
        </Statistic>
      </Segment>
    </Grid.Column>
    <Grid.Column>
      <Segment>
        <Statistic size="tiny">
          <Statistic.Value>
            <Icon name="world" />
            {illegitimateSources}
          </Statistic.Value>
          <Statistic.Label>Illegitimate Sources</Statistic.Label>
        </Statistic>
      </Segment>
    </Grid.Column>
  </Grid>
);

export default Statistics;
