import React, { PureComponent } from 'react';

const THRESHOLD = 3;
class Tags extends PureComponent {
  state = { isExpanded: !this.props.content.length > THRESHOLD }

  toggleExpand = () => this.setState({ isExpanded: !this.state.isExpanded })

  render() {
    const { content } = this.props;
    const { isExpanded } = this.state;
    const tags = isExpanded ? content : content.slice(0, THRESHOLD);

    return (
      <span>
        <span className="article-tags">{content.length > 0 ? tags.join(', ') : <span className="no-info">No information found</span>}</span>&nbsp;
        <span color="blue" className="article-tags see-more" onClick={this.toggleExpand}>
          {content.length > THRESHOLD ? `${isExpanded ? '...less' : 'more...'}` : null}
        </span>
      </span>
    );
  }
}

export default Tags;

