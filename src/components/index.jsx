// import React from 'react';
import './index.less';

export default class App extends React.Component{
  constructor() {
    super();
    this.state = {}
  }
  render() {
    return <div>这是首页组件<a href="./pageA.html">去A页面</a></div>
  }
}