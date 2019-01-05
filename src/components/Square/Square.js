import React from 'react';
import './Square.css';

// class Square extends React.Component {
//   render() {
//     return (
//       <button className="square" onClick={() => this.props.onClick()}>
//         {this.props.value}
//       </button>
//     );
//   }
// }

// React 专门为像上面这种只有 render 方法的组件提供了一种更简便的定义组件的方法：函数定义组件 。
// 只需要简单写一个以 props 为参数的 function 返回 JSX 元素就搞定了。
// https://react.docschina.org/tutorial/tutorial.html#%E5%87%BD%E6%95%B0%E5%AE%9A%E4%B9%89%E7%BB%84%E4%BB%B6

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

export default Square;
