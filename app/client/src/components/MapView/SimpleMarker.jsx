import React, { Component } from 'react';
import { Label, Popup, Item, Icon, Image } from 'semantic-ui-react';
import shortid from 'shortid';
import './styles.css';

class SimpleMarker extends Component {
  render() {
    const {
      article: {
        topImageUrl,
        url,
        sourceUrl,
        source,
        title,
        authors,
        publishDate,
        summary,
        summary2,
      },
    } = this.props;

    return (
      <div className="simple-marker-container">
        <Popup
          position="right center"
          wide="very"
          trigger={<Icon color="red" name="marker" size="huge" />}
          hoverable
          flowing
        >
          <Item.Group>
            <Item>
              <Item.Image>
                <Image
                  src={topImageUrl}
                  shape="rounded"
                  className="simple-marker-image"
                />
                <Item.Extra>
                  <Label>
                    <Icon name="newspaper" />
                    <a href={sourceUrl} target="_blank">{source}</a>
                  </Label>
                  {authors.map((author) => (
                    <Label
                      key={shortid.generate()}
                      icon="user outline"
                      content={author}
                    />
                    ))}
                  {/* {categories.map((category, i) => {
                    const [main, sub] = category.label.split('-');
                    return (
                      <Popup
                        position="left center"
                        key={i}
                        trigger={<Label content={toTitleCase(main)} />}
                        hoverable
                      >
                        {toTitleCase(sub)}
                      </Popup>
                    );
                  })} */}
                </Item.Extra>
                <Item.Extra>{new Date(publishDate).toLocaleDateString()}</Item.Extra>
              </Item.Image>
              <Item.Content>
                <Item.Header>
                  <a href={url} target="_blank">
                    {title}
                  </a>
                </Item.Header>
                <Item.Meta>Summary</Item.Meta>
                <Item.Description className="simple-marker-description">
                  {summary2}
                </Item.Description>
                <Item.Extra style={{ width: '500px' }}>
                  <Label color="red" pointing="right" basic>Entities</Label>
                  {/* {entities.person && entities.person.map((person, i) => (
                    <Label
                      icon="user outline"
                      key={i}
                      content={person}
                    />
                  ))}
                  {entities.organization && entities.organization.map((org, i) => (
                    <Label
                      icon="briefcase"
                      key={i}
                      content={org}
                    />
                  ))}
                  {entities.location && entities.location.map((loc, i) => (
                    <Label
                      icon="world"
                      key={i}
                      content={loc}
                    />
                  ))} */}
                </Item.Extra>
              </Item.Content>
            </Item>
          </Item.Group>
        </Popup>
      </div>
    );
  }
}

export default SimpleMarker;
