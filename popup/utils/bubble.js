export async function showBubble(message, duration, button) {
    const container = document.getElementById('bubble-container');

    // Create the bubble element
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = message;

    container.appendChild(bubble);

    // Position the bubble above the button
    const buttonRect = button.getBoundingClientRect();
    bubble.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
    bubble.style.top = `${buttonRect.top - 120}px`; // Slightly above the button
    bubble.style.transform = 'translateX(-50%)';

    // Trigger the fade-in animation
    requestAnimationFrame(() => {
        bubble.classList.add('fade-in');
    });

    // Wait for the specified duration
    await delay(duration);

    // Trigger fade-out animation
    bubble.classList.replace('fade-in', 'fade-out');

    // Wait for the fade-out transition to complete
    await new Promise(resolve => {
        bubble.addEventListener('transitionend', resolve, { once: true });
    });

    bubble.remove();
}

// Helper function to create a delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}