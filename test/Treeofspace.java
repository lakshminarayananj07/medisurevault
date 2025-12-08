// Online Java Compiler
// Use this editor to write, compile and run your Java code online

import java.util.*;

public class Treeofspace {

    // ✅ Make Node static so it can be used in static methods
    static class Node {
        Node parent;
        List<Node> child;
        boolean locked;
        Integer lockedBy;
        int lockedDescendants;

        public Node() {
            this.parent = null;
            this.child = new ArrayList<>();
            this.locked = false;
            this.lockedBy = null;
            this.lockedDescendants = 0;
        }
    }

    private static boolean lock(Node node, int id) {
        if (node.locked || hasLockedAncestors(node) || hasLockedDescendants(node)) {
            return false;
        }
        node.locked = true;
        node.lockedBy = id;
        updateAncestorsLockedDescendants(node, 1);
        return true;
    }

    private static boolean unlock(Node node, int id) {
        if (!node.locked || !Objects.equals(node.lockedBy, id)) {
            return false;
        }
        node.locked = false;
        node.lockedBy = null;
        updateAncestorsLockedDescendants(node, -1);
        return true;
    }

    private static boolean upgrade(Node node, int id) {
        if (node.locked || hasLockedAncestors(node) || !hasLockedDescendants(node)) {
            return false;
        }
        if (!allDescendantsLockedBy(node, id)) {
            return false;
        }
        unlockAllDescendants(node);
        node.locked = true;
        node.lockedBy = id;
        updateAncestorsLockedDescendants(node, 1);
        return true;
    }

    private static boolean hasLockedAncestors(Node node) {
        while (node.parent != null) {
            if (node.parent.locked) {
                return true;
            }
            node = node.parent;
        }
        return false;
    }

    private static boolean hasLockedDescendants(Node node) {
        return node.lockedDescendants > 0;
    }

    private static boolean allDescendantsLockedBy(Node node, int id) {
        Stack<Node> stack = new Stack<>();
        stack.add(node);
        while (!stack.isEmpty()) {
            Node current = stack.pop();
            if (current.locked && !Objects.equals(current.lockedBy, id)) {
                return false;
            }
            for (Node child : current.child) {
                stack.add(child);
            }
        }
        return true;
    }

    private static void unlockAllDescendants(Node node) {
        Stack<Node> stack = new Stack<>();
        for (Node child : node.child) {
            stack.push(child);
        }
        while (!stack.isEmpty()) {
            Node current = stack.pop();
            if (current.locked) {
                current.locked = false;
                current.lockedBy = null;
                updateAncestorsLockedDescendants(current, -1);
            }
            for (Node child : current.child) {
                stack.push(child);
            }
        }
    }

    private static void updateAncestorsLockedDescendants(Node node, int delta) {
        while (node.parent != null) {
            node.parent.lockedDescendants += delta;
            node = node.parent;
        }
    }

    public static void main(String[] args) {
        Scanner scn = new Scanner(System.in);

        int n = scn.nextInt(); // number of nodes
        int k = scn.nextInt(); // branching factor
        int q = scn.nextInt(); // number of queries

        HashMap<String, Node> hash = new HashMap<>();
        String[] arr = new String[n];

        // ✅ Read node names one per line
        for (int i = 0; i < n; i++) {
            arr[i] = scn.next();
        }

        Node root = new Node();
        hash.put(arr[0], root);
        Queue<Node> que = new LinkedList<>();
        que.add(root);

        int index = 1;
        while (!que.isEmpty() && index < n) {
            int size = que.size();
            for (int j = 0; j < size; j++) {
                Node rem = que.remove();
                for (int i = 1; i <= k && index < n; i++) {
                    Node newNode = new Node();
                    newNode.parent = rem;
                    hash.put(arr[index], newNode);
                    rem.child.add(newNode);
                    que.add(newNode);
                    index++;
                }
            }
        }

        // ✅ Process queries
        for (int i = 0; i < q; i++) {
            int val = scn.nextInt();
            String str = scn.next();
            int id = scn.nextInt();
            Node node = hash.get(str);
            boolean ans = switch (val) {
                case 1 -> lock(node, id);
                case 2 -> unlock(node, id);
                case 3 -> upgrade(node, id);
                default -> false;
            };
            System.out.println(ans);
        }

        scn.close();
    }
}
