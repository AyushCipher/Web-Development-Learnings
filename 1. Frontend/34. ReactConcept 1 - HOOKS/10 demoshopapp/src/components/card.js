import './card.css'
function card(props) {
    return <div className= 'card'>
        {props.children}
    </div>;
}

export default card;