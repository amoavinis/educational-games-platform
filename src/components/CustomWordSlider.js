import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import "../styles/CustomWordSlider.css";

/**
 * CustomWordSlider - A modular slider component that divides into sections
 * matching word part lengths and allows dragging to highlight word sections.
 *
 * @param {Array} sections - Array of {text, color} objects representing word parts
 * @param {Function} onSliderChange - Callback(sectionIndex, subPosition) when slider moves
 *   - sectionIndex: which section (0, 1, 2...)
 *   - subPosition: 'start' or 'middle' of that section
 */
const CustomWordSlider = ({ sections, onSliderChange }) => {
  const [sliderPosition, setSliderPosition] = useState(0); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const trackRef = useRef(null);

  // Reset slider position when sections change (new word)
  useEffect(() => {
    setSliderPosition(0);
  }, [sections]);

  // Calculate section widths based on text lengths
  const sectionWidths = useMemo(() => {
    const totalLength = sections.reduce((sum, section) => sum + section.text.length, 0);
    return sections.map((section) => (section.text.length / totalLength) * 100);
  }, [sections]);

  // Calculate snap points (start of each section + middle of each section)
  const snapPoints = useMemo(() => {
    const points = [];
    let cumulativeWidth = 0;
    sections.forEach((section, index) => {
      const sectionWidth = sectionWidths[index] / 100;
      // Start of section
      points.push({
        position: cumulativeWidth,
        sectionIndex: index,
        subPosition: "start",
      });
      // Middle of section
      points.push({
        position: cumulativeWidth + sectionWidth / 2,
        sectionIndex: index,
        subPosition: "middle",
      });
      cumulativeWidth += sectionWidth;
    });
    // Add end point
    points.push({
      position: 1,
      sectionIndex: sections.length - 1,
      subPosition: "end",
    });
    return points;
  }, [sections, sectionWidths]);

  // Find nearest snap point
  const findNearestSnapPoint = useCallback(
    (position) => {
      let nearest = snapPoints[0];
      let minDistance = Math.abs(position - snapPoints[0].position);

      snapPoints.forEach((snap) => {
        const distance = Math.abs(position - snap.position);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = snap;
        }
      });

      return nearest;
    },
    [snapPoints]
  );

  // Determine current section and sub-position based on slider position
  const getCurrentSection = useCallback(
    (position) => {
      let cumulativeWidth = 0;
      for (let i = 0; i < sections.length; i++) {
        const sectionWidth = sectionWidths[i] / 100;
        const sectionStart = cumulativeWidth;
        const sectionMid = cumulativeWidth + sectionWidth / 2;
        const sectionEnd = cumulativeWidth + sectionWidth;

        if (position >= sectionStart && position < sectionEnd) {
          // Determine if we're in the first or second half of the section
          const subPosition = position < sectionMid ? "start" : "middle";
          return { sectionIndex: i, subPosition };
        }

        cumulativeWidth += sectionWidth;
      }

      // If we're at or past the end, return the last section
      return { sectionIndex: sections.length - 1, subPosition: "end" };
    },
    [sections, sectionWidths]
  );

  // Handle mouse/touch move
  const handleMove = useCallback(
    (clientX) => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const position = Math.max(0, Math.min(1, x / rect.width));

      setSliderPosition(position);

      // Update parent component in real-time as slider moves
      const currentSection = getCurrentSection(position);
      if (onSliderChange) {
        onSliderChange(currentSection.sectionIndex, currentSection.subPosition);
      }
    },
    [getCurrentSection, onSliderChange]
  );

  // Handle drag end - snap to nearest point
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);

    const nearest = findNearestSnapPoint(sliderPosition);
    setSliderPosition(nearest.position);

    // Notify parent component
    if (onSliderChange) {
      onSliderChange(nearest.sectionIndex, nearest.subPosition);
    }
  }, [sliderPosition, findNearestSnapPoint, onSliderChange]);

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleDragEnd, handleMove]);

  // Touch events
  const handleTouchStart = (e) => {
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  // Calculate filled width for each section
  const calculateFilledWidth = (sectionIndex) => {
    let cumulativeWidth = 0;
    for (let i = 0; i < sectionIndex; i++) {
      cumulativeWidth += sectionWidths[i] / 100;
    }

    const sectionStart = cumulativeWidth;
    const sectionEnd = cumulativeWidth + sectionWidths[sectionIndex] / 100;

    if (sliderPosition <= sectionStart) {
      return 0;
    } else if (sliderPosition >= sectionEnd) {
      return 100;
    } else {
      const progress = (sliderPosition - sectionStart) / (sectionEnd - sectionStart);
      return progress * 100;
    }
  };

  return (
    <div className="custom-word-slider">
      <div className="slider-track" ref={trackRef}>
        {sections.map((section, index) => {
          const filledWidth = calculateFilledWidth(index);
          return (
            <div
              key={index}
              className="slider-section"
              style={{
                width: `${sectionWidths[index]}%`,
              }}
            >
              <div className="section-background" style={{ backgroundColor: "#e0e0e0" }}></div>
              <div
                className="section-filled"
                style={{
                  width: `${filledWidth}%`,
                  backgroundColor: section.color,
                }}
              ></div>
            </div>
          );
        })}
        <div
          className="slider-handle"
          ref={sliderRef}
          style={{ left: `${sliderPosition * 100}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="handle-circle"></div>
        </div>
      </div>
    </div>
  );
};

export default CustomWordSlider;
