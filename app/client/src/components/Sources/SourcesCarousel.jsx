import React, { Component } from 'react';
import { Button, Icon, List } from 'semantic-ui-react';
import shortid from 'shortid';

const CarouselArrow = (arrow) => (
  <Button
    color="grey"
    className="carousel-arrow"
    onClick={arrow.onClick}
    size="mini"
  >
    <Icon name={`chevron ${arrow.direction}`} />
  </Button>
);

const CarouselSlide = ({
  slide,
  index,
  activeIndex,
}) => (
  <li
      className={
        index === activeIndex
          ?
          'carousel-slide carousel-slide-active'
          :
          'carousel-slide'
      }
    >
				<List ordered>
					{console.log(slide)}
					{slide}
				</List>
    </li>
);

const CarouselSummaryNumber = ({
  index,
  activeIndex,
}) => (
  <li
      className={
        index === activeIndex
          ?
          'carousel-slide carousel-slide-active'
          :
          'carousel-slide'
      }
    >
      <p className="carousel-slide-content article-tags">
        Summary {index + 1}
      </p>
    </li>
);

class Carousel extends Component {
  state = {
    activeIndex: 0,
  };

  goToPreviousSlide = () => {
    let { activeIndex } = this.state;
    const { content = [] } = this.props;
    const summaryLength = content.length;

    this.setState({
      activeIndex: activeIndex < 1 ? activeIndex = summaryLength - 1 : activeIndex - 1,
    });
  }

  goToNextSlide = () => {
    let { activeIndex } = this.state;
    const { content } = this.props;
    const summaryLength = content.length - 1;

    this.setState({
      activeIndex: activeIndex === summaryLength ? activeIndex = 0 : activeIndex + 1,
    });
  }

  render() {
    const { content = [] } = this.props;
    const { activeIndex } = this.state;

    return (
      <div className="carousel">
        <ul className="carousel-slides">
					{content.map((rawr) => (
						<CarouselSlide
						activeIndex={activeIndex}
						slide={rawr}
					/>
					))}
        </ul>

        <div className="carousel-arrows">
          <CarouselArrow onClick={this.goToPreviousSlide} direction="left" />
          <ul className="carousel-slides">
            {content.map((sum, index) => (
              <CarouselSummaryNumber
                key={shortid.generate()}
                index={index}
                activeIndex={activeIndex}
              />
            ))}
          </ul>
          <CarouselArrow onClick={this.goToNextSlide} direction="right" />
        </div>
      </div>
    );
  }
}

export default Carousel;
