---
title: "A Bell state in four lines"
subtitle: "Hadamard, CNOT, and the smallest example of entanglement"
date: 2026-09-30T18:05:00+01:00
author: "Pedro Jorge"
slug: "a-bell-state-in-four-lines"
description: "Building the Bell state |Φ⁺⟩ with a Hadamard and a CNOT, and checking it by hand."
draft: false
---

Start from two qubits in $\lvert 00\rangle$. A Hadamard on the first qubit
gives $\tfrac{1}{\sqrt 2}(\lvert 0\rangle + \lvert 1\rangle)\otimes\lvert 0\rangle$;
a CNOT controlled by it flips the second qubit exactly when the first is
$\lvert 1\rangle$:

$$
\mathrm{CNOT}\,(H \otimes I)\,\lvert 00\rangle
= \frac{\lvert 00\rangle + \lvert 11\rangle}{\sqrt 2}
= \lvert \Phi^+ \rangle .
$$

The state is not a product $\lvert a\rangle \otimes \lvert b\rangle$: if it
were, the coefficient matrix $\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}/\sqrt2$
would have rank 1, but it has rank 2.

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
```

Measuring both qubits gives `00` or `11`, each with probability $1/2$ — never
`01` or `10`.
