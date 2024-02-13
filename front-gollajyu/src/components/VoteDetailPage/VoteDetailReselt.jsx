import React, { useState } from 'react';

// 임시 데이터를 상위 컴포넌트로부터 받아오는 props로 변경
const VoteDetailResult = ({voteResults}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleClick = (index) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[index] = !newSelectedOptions[index];
    setSelectedOptions(newSelectedOptions);
  };
  
  return (
    <div className='flex w-full' style={{display: "flex"}}>
      {voteResults.map((result, index) => (
        <div key={index} style={{border: "1px solid black", width: "280px", margin: "10px", padding: "10px"}}>
          <h2>{result.choiceCnt}: %</h2>
          <button onClick={() => handleClick(index)}>▼</button>
          {selectedOptions[index] && (
            <div>
              {result.tagCountList.map((tag) => (
                <p key={tag.tagName}>{tag.tagName}: {tag.count}%</p>
              ))}
            </div>
          )}
        </div>
      ))}
      {/* 사용자 유형 필터링 핑료 */}
    </div>
  );
};

export default VoteDetailResult;