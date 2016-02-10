import React from 'react'
import Header from './Header'
import ReactDOM from 'react-dom';
import $ from 'jquery';

import { GridList, GridTile } from 'material-ui/lib/grid-list';
//import Colors from 'material-ui/lib/styles/colors';
import CameraEnhance from 'material-ui/lib/svg-icons/action/camera-enhance';
import IconButton from 'material-ui/lib/icon-button';
import Comment from 'material-ui/lib/svg-icons/communication/comment';
import LocalGrocery from 'material-ui/lib/svg-icons/maps/local-grocery-store';
import Star from 'material-ui/lib/svg-icons/toggle/star';
import Avatar from 'material-ui/lib/avatar';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';


import { Modal, Button } from 'react-bootstrap';
import RaisedButton from 'material-ui/lib/raised-button';
import PhotoUpload from './PhotoUpload'


export default class MyRecipes extends React.Component {

  componentWillMount() {
    this.props.getChosenRecipes(this.props.userid);
  }
  
  constructor(props) {
    super(props);
    this.styles = {
      width:"400px"
    }
    this.gridStyles = {
      gridList: {
        width: "100%",
        height: "100%",
        overflowY: 'auto',
        marginBottom: 24,
        display: "inline"
      }
    }
    this.avatar = {

    }

    this.state = {
      currRecipeId: 0,
      uploadCount:0
    }
    this.increaseUploadCount = this.increaseUploadCount.bind(this);
  }

  handleTouchTap(element) {
    console.log("inside MyRecipes", element)
    this.props.openSocialModal(element);
  }

  increaseUploadCount() {
    this.setState({uploadCount: this.state.uploadCount+1});
    console.log('increased counter', this.state.uploadCount);
    this.props.getChosenRecipes(this.props.userid);
  }

  handleAction(element) {
    console.log(element.name, element.recipeid)
    this.setState({currRecipeId: element.recipeid});
    $('.dz-default').trigger('click');
    //upload photo
  }

  handleAddToCart(element) {
    console.log("ADDING TO CART", element.name, element.recipeid);
    this.props.showModal(element)
  }

  render() {
    return (
    <div className="myprofile-container" >
    <div className="row">
      <div className="avatar .col-xs-4" >
        <Avatar src="https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwiLi7Ln69zKAhUNxWMKHZo6CKMQjRwIBw&url=http%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fcooks-people&bvm=bv.113370389,d.cGc&psig=AFQjCNFk8JDd74HqUtWZAypvRUyzolx3UA&ust=1454631766701909" 
        size={75}
        /> {this.props.userid}
      </div>
      <div className="user-info .col-xs-8" >
        <div className="user-data row">
          <div className="user-meals .col-xs-6" >
            <div className="meals-# row" >
              <h3>95</h3>
            </div>
            <div className="meals-label row" >
              <h3>meals</h3>
            </div>
          </div>
          <div className="user-posts .col-xs-6" >
            <div className="posts-# row" >
              <h3>27</h3>
            </div>
            <div className="posts-label row" >
              <h3>posts</h3>
            </div>
          </div>
        </div>
        <div className="edit-profile row">
          <h2>Edit Your Profile</h2>
        </div>
      </div>
      
    </div>
    <div className="myrecipe-container" >
    <h1>My Recipes</h1>
    <GridList
        cellHeight={250}
        cols={2}
        style={this.styles}
        >
      {this.props.chosenRecipes.map((tile,index) => (
        <GridTile
          key={index}
          title={<IconButton className="tile-icons" onTouchTap={this.handleAddToCart.bind(this, tile)}><LocalGrocery color="white"/></IconButton>}
          //this.handleAction.bind(this, tile)
          actionPosition="right"
          actionIcon={<IconButton className="tile-icons" onTouchTap={this.handleAction.bind(this, tile)}><CameraEnhance color="white"/></IconButton>}>
          <img src={tile.userimage || tile.recipeimage} />
        </GridTile>
      ))}
    </GridList>
    <PhotoUpload
      userid={this.props.userid}
      recipeid={this.state.currRecipeId}
      increaseUploadCount={this.increaseUploadCount}
      />
    </div>
    )
  }
}
          // actionIcon={<IconButton onTouchTap={this.handleAction.bind(this, tile)}><LocalGrocery color="white"/></IconButton>}>
          // subtitle={<IconButton className="tile-icons" onTouchTap={this.handleAction.bind(this, tile)}><Star color="white"/></IconButton>}
//<OverlayTrigger trigger="hover" placement="bottom" overlay={<Popover title="Popover bottom"><strong>Holy guacamole!</strong> Check this info.</Popover>}>
      // <Button bsStyle="default">Hover</Button>
    // </OverlayTrigger>
