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
	<div className={index === activeIndex ? 'carousel-slide carousel-slide-active' : 'carousel-slide'}>
	<List ordered>
			{slide.map((cont) => (
				<List.Item className="carousel-slide-content">{cont}</List.Item>
			))}
		</List>
	</div>
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
  />
);

class SourcesCarousel extends Component {
  state = {
    activeIndex: 0,
  };

  goToPreviousSlide = () => {
    let { activeIndex } = this.state;
    const { reliableContent } = this.props;
    const summaryLength = reliableContent.length;

    this.setState({
      activeIndex: activeIndex < 1 ? activeIndex = summaryLength - 1 : activeIndex - 1,
    });
  }

  goToNextSlide = () => {
    let { activeIndex } = this.state;
    const { reliableContent } = this.props;
    const summaryLength = reliableContent.length - 1;

    this.setState({
      activeIndex: activeIndex === summaryLength ? activeIndex = 0 : activeIndex + 1,
    });
  }

  render() {
    const {
			activeItem,
			reliableContent = [],
			unreliableContent = []
		} = this.props;
    const { activeIndex } = this.state;

    return (
      <div className="carousel">
        <ul className="carousel-slides">
					{activeItem === 'reliable' ? (
						reliableContent.map((content, index) => (
							<CarouselSlide
								key={shortid.generate()}
								index={index}
								activeIndex={activeIndex}
								slide={content}
							/>
						))
					) : (
						unreliableContent.map((content, index) => (
							<CarouselSlide
								key={shortid.generate()}
								index={index}
								activeIndex={activeIndex}
								slide={content}
							/>
						))
					)
					}
        </ul>

        <div className="carousel-arrows">
          <CarouselArrow onClick={this.goToPreviousSlide} direction="left" />
          <CarouselArrow onClick={this.goToNextSlide} direction="right" />
        </div>
      </div>
    );
  }
}

export default SourcesCarousel;
