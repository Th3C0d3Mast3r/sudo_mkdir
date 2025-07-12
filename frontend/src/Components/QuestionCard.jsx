import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import styled from 'styled-components';

const QuestionCard = () => {
  return (
    <div className="bg-[#19376D] text-white rounded-2xl p-6 mb-4 shadow-lg">
      <h2 className="text-2xl font-semibold font-header mb-1">Question Title</h2>
      <p className="text-sm text-white/70 mb-2">user-Name</p>
      <p className="mb-4 text-base leading-relaxed text-white">
        Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece...
      </p>
      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          {["React", "Tailwind", "Slate.js"].map((tag, idx) => (
            <span
              key={idx}
              className="bg-[#A5D7E8] text-[#091D39] rounded-full px-3 py-1 text-xs font-bold"
            >
              {tag}
            </span>
          ))}
          <span className="bg-white text-[#19376D] rounded-full px-3 py-1 text-xs font-bold">
            +4 more
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <VoteButton iconNode={ArrowBigUp} />
          <span>68</span>
          <VoteButton iconNode={ArrowBigDown} />
          <span>68</span>
        </div>
      </div>
    </div>
  );
};

const VoteButton = ({ iconNode: Icon }) => (
  <button className="bg-black px-3 py-1 rounded-full text-white font-semibold hover:bg-white hover:text-black transition">
    <Icon size={18} />
  </button>
);

export const StyledButton = ({ children = 'Button', className }) => {
  return (
    <StyledWrapper className={className}>
      <button>
        <span className="button_top">{children}</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  button {
    --button_radius: 0.75em;
    --button_color: #e8e8e8;
    --button_outline_color: #000000;
    font-size: 17px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    border-radius: var(--button_radius);
    background: var(--button_outline_color);
    padding: 0;
  }

  .button_top {
    display: block;
    box-sizing: border-box;
    border: 2px solid var(--button_outline_color);
    border-radius: var(--button_radius);
    padding: 0.75em 1.5em;
    background: var(--button_color);
    color: var(--button_outline_color);
    transform: translateY(-0.2em);
    transition: transform 0.1s ease, background 0.2s ease, color 0.2s ease;
  }

  button:hover .button_top {
    transform: translateY(-0.33em);
  }

  button:active .button_top {
    transform: translateY(0);
  }
`;

export default QuestionCard;