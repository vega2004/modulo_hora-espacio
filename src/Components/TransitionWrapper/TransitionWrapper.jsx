import React, { useRef } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import './TransitionWrapper.css';

const TransitionWrapper = ({ location, children }) => {
    const nodeRef = useRef(null);

    return (
        <SwitchTransition>
            <CSSTransition
                key={location.pathname}
                timeout={400}
                classNames="zoom-fade"
                unmountOnExit
                nodeRef={nodeRef} 
            >
                <div ref={nodeRef}>
                    {children}
                </div>
            </CSSTransition>
        </SwitchTransition>
    );
};

export default TransitionWrapper;
