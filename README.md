# Plinko
A Bernoulli trial is an experiment that results in a success with probability p and a failure with probability 1-p. A random variable is said to have a Binomial Distribution if it is the result of recording the number of successes in n independent Bernoulli trials.

In the applet below, we have represented repeated independent Bernoulli trials by a single ball falling through an array of pins. Each time a ball falls onto a pin, it will bounce to the right (i.e. a success) with probability p or to the left (i.e. a failure) with probability 1-p. After the ball falls through the array, it lands in a bin labeled by the corresponding number of successes.

Click on a bin to see its corresponding total and probability. Also displayed is a confidence interval centered on the theoretical expected bin. Bins that are included in this confidence interval are highlighted in light blue.

The name Plinko refers to a game played on The Price Is Right. However, the game show version is played on a rectangular array of pins instead of a triangular array. It would be more appropriate to call our applet Galton's board or a quincunx board; however this is far more difficult to pronounce.

## Usage

Clone or download this repository. On your computer, naviagte to the repository and open index.html in any browser.

On the top, there are three controls for the number of bins(2-20), probability(0-1), and the speed of the ball(1-5),
to start, click the start button and the balls will start dropping.

In the bottom, statistics for total balls, mean, and variance will be displayed, click on a single bin to see its own
statistics.