import { PlayerData } from './PlayerStats';

import '../styles/Scoreboard.css';

type Column = {
  key: string;
  label: string;
};

type ScoreboardProps = {
  rows: PlayerData[];
  columns: Column[];
};

function Scoreboard({ rows, columns }: ScoreboardProps) {
  if (rows.length === 0) {
    return <table></table>;
  }

  return (
    <table className="table-scroll">
      <thead>
        <tr>
          {columns.map((col) => {
            return (
              <th key={`col-${col.key}`} className="capitalize">
                {col.label}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIdx) => {
          return (
            <tr key={`row-${rowIdx}`} style={{ color: row.color.fg, backgroundColor: row.color.bg }}>
              {columns.map((column, colIdx) => {
                return <td key={`cell-${colIdx}`}>{String(row.data[column.key])}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Scoreboard;
