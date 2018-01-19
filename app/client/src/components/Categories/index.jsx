import React, { Component } from 'react';
import { Segment, Label, Icon } from 'semantic-ui-react';
import shortid from 'shortid';
import './styles.css';


class Categories extends Component {
  categories = [
    { color: 'purple', icon: 'pie chart', name: 'Business' },
    { color: 'orange', icon: 'money', name: 'Economy & Finance' },
    { color: 'teal', icon: 'leaf', name: 'Lifestyle' },
    { color: 'olive', icon: 'ambulance', name: 'Accident' },
    { color: 'violet', icon: 'computer', name: 'Entertainment' },
    { color: 'teal', icon: 'soccer', name: 'Sports' },
    { color: 'yellow', icon: 'legal', name: 'Government & Politics' },
    { color: 'violet', icon: 'heartbeat', name: 'Health' },
    { color: 'green', icon: 'flask', name: 'Science & Technology' },
    { color: 'teal', icon: 'ban', name: 'Crime' },
    { color: 'purple', icon: 'umbrella', name: 'Weather' },
    { color: 'orange', icon: 'add square', name: 'Calamity' },
    { color: 'blue', icon: 'users', name: 'Nation' },
    { color: 'olive', icon: 'book', name: 'Education' },
    { color: 'violet', icon: 'food', name: 'Food' },
  ]
  render() {
    return (
      <div>
        <Segment>
          <Label ribbon color="orange">Categories</Label>
          <div className="cat-scrollable-section">
            {this.categories.map((category) => (
              <Segment color={category.color}>
                <Icon name={category.icon} color="grey" className="category-icon" />
                {category.name}
              </Segment>
            ))}
          </div>
        </Segment>
      </div>
    );
  }
}

export default Categories;
