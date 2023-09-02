import '../styles/Modal.css';

type WinnerModalProps = {
  headerText: string;
  bodyText: string;
  footerText: string;
};

function WinnerModal({ headerText, bodyText, footerText }: WinnerModalProps) {
  return (
    <div id="winnerModal" className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{headerText}</h2>
        </div>
        <div className="modal-body">
          <p>{bodyText}</p>
        </div>
        <div className="modal-footer">
          <h3>{footerText}</h3>
        </div>
      </div>
    </div>
  );
}

export default WinnerModal;
