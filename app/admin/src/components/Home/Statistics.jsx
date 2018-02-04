import React from 'react';
import { Grid, Statistic, Icon, Segment } from 'semantic-ui-react';

const Statistics = ({
  notCredibleArticles,
  credibleArticles,
  pendingSources,
  credibleSources,
  notCredibleSources,
}) => (
  <Grid columns="equal">
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
            <Icon name="newspaper" />
            {credibleArticles}
          </Statistic.Value>
          <Statistic.Label>Credible Articles</Statistic.Label>
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
    <Grid.Column>
      <Segment>
        <Statistic size="tiny">
          <Statistic.Value>
            <Icon name="newspaper" />
            {notCredibleArticles}
          </Statistic.Value>
          <Statistic.Label>Not Credible Articles</Statistic.Label>
        </Statistic>
      </Segment>
    </Grid.Column>
  </Grid>
);

export default Statistics;
