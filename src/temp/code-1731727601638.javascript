function findPeakElement(nums) {
  let left = 0, right = nums.length - 1;
  
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    
    // Check if mid element is greater than its right neighbor
    if (nums[mid] > nums[mid + 1]) {
      right = mid; // Peak element lies on the left side or at mid
    } else {
      left = mid + 1; // Peak element lies on the right side
    }
  }
  
  return left; // Return the index of the peak element
}